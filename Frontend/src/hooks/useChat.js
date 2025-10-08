

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
// Helper to get userId from query param
function getUserIdFromQuery() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('userId');
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]); // [{id, username, online}]
  const [activeUser, setActiveUser] = useState(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : {};
  });
  // Load chatHistory from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) setChatHistory(JSON.parse(saved));
  }, []);

  // Get logged-in userId from token
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || '';
    } catch {
      return '';
    }
  }
  const myUserId = getUserIdFromToken();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);
    // Join event
    newSocket.emit('join', myUserId);

    newSocket.on('userList', (userList) => {
      // Mark online users
      setUsers(userList.filter(u => u.id !== myUserId).map(u => ({ ...u, online: true })));
    });

    newSocket.on('message', (message) => {
      // Determine the chat partner
      const partnerId = message.from === myUserId ? message.to : message.from;
      let senderType = message.from === myUserId ? 'me' : 'them';

      setChatHistory((prevHistory) => {
        const updatedHistory = { ...prevHistory };
        if (!updatedHistory[partnerId]) updatedHistory[partnerId] = [];
        // If chat not open, mark as unread
        const isActive = activeUser && activeUser.id === partnerId;
        // Replace temp message with real one if exists
        let replaced = false;
        updatedHistory[partnerId] = updatedHistory[partnerId].map(m => {
          if (!replaced && m.text === message.text && m.sender === senderType && !m._id && m.id && m.id.startsWith('local-')) {
            replaced = true;
            return {
              ...message,
              sender: senderType,
              read: isActive,
              from: message.from || m.from,
              to: message.to || m.to,
              _id: message._id || m._id,
              id: message.id || m.id
            };
          }
          // Always ensure from/to/sender/id/_id
          return {
            ...m,
            from: m.from || message.from,
            to: m.to || message.to,
            sender: m.sender || senderType,
            id: m.id,
            _id: m._id
          };
        });
        // If not replaced, just add
        if (!replaced) {
          updatedHistory[partnerId] = [
            ...updatedHistory[partnerId],
            {
              ...message,
              sender: senderType,
              read: isActive,
              from: message.from,
              to: message.to,
              _id: message._id,
              id: message.id
            }
          ];
        }
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      // If the message is for the active user, update messages state
      if (activeUser && activeUser.id === partnerId) {
        setMessages((prev) => {
          let replaced = false;
          const newArr = prev.map(m => {
            if (!replaced && m.text === message.text && m.sender === senderType && !m._id && m.id && m.id.startsWith('local-')) {
              replaced = true;
              return {
                ...message,
                sender: senderType,
                read: true,
                from: message.from || m.from,
                to: message.to || m.to,
                _id: message._id || m._id,
                id: message.id || m.id
              };
            }
            // Always ensure from/to/sender/id/_id
            return {
              ...m,
              from: m.from || message.from,
              to: m.to || message.to,
              sender: m.sender || senderType,
              id: m.id,
              _id: m._id
            };
          });
          if (!replaced) {
            return [...newArr, {
              ...message,
              sender: senderType,
              read: true,
              from: message.from,
              to: message.to,
              _id: message._id,
              id: message.id
            }];
          }
          return newArr;
        });
      }
    });

    return () => newSocket.close();
  }, [myUserId, activeUser]);

  // Select user to chat
  const selectUser = (userId) => {
    // userId can be user object or id
    let userObj;
    if (typeof userId === 'object' && userId.id) {
      userObj = userId;
    } else {
      // Try to find in users array
      userObj = users.find(u => u.id === userId);
      // Try to find in recent users from localStorage if not found
      if (!userObj) {
        try {
          const recent = JSON.parse(localStorage.getItem('recentChatUsers')) || [];
          userObj = recent.find(u => u.id === userId);
        } catch { userObj = null; }
      }
      // Fallback to id and Unknown username
      if (!userObj) userObj = { id: userId, username: 'Unknown' };
    }
    // Always add to recentChatUsers
    try {
      const recent = JSON.parse(localStorage.getItem('recentChatUsers')) || [];
      const exists = recent.find(u => String(u.id) === String(userObj.id));
      if (!exists) {
        const newUser = {
          id: userObj.id,
          username: userObj.username,
          profileImage: userObj.profileImage || '',
        };
        const newList = [newUser, ...recent.filter(u => String(u.id) !== String(newUser.id))];
        localStorage.setItem('recentChatUsers', JSON.stringify(newList));
      }
    } catch {}
    setActiveUser(userObj);
    // Mark all messages as read for this user
    setChatHistory(prevHistory => {
      const updatedHistory = { ...prevHistory };
      if (updatedHistory[userObj.id]) {
        updatedHistory[userObj.id] = updatedHistory[userObj.id].map(m => ({ ...m, read: true }));
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
    // Load chat history from state or localStorage
    setMessages((chatHistory[userObj.id] || []).map(m => ({ ...m, read: true })));
  };

  // Send message to active user
  const sendMessage = (text) => {
    if (socket && activeUser) {
      // Add message immediately to UI with a unique id
      const tempId = 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const newMessage = { from: myUserId, to: activeUser.id, text, sender: 'me', id: tempId };
      setChatHistory((prevHistory) => {
        const updatedHistory = { ...prevHistory };
        if (!updatedHistory[activeUser.id]) updatedHistory[activeUser.id] = [];
        updatedHistory[activeUser.id] = [...updatedHistory[activeUser.id], newMessage];
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      setMessages((prev) => [...prev, newMessage]);

      socket.emit('message', { to: activeUser.id, text });
    }
  };

  // On mount, if userId in query param, auto-select that user
  useEffect(() => {
    const userIdFromQuery = getUserIdFromQuery();
    if (userIdFromQuery) {
      selectUser(userIdFromQuery);
    }
    // eslint-disable-next-line
  }, []);

  // Delete message by id
  const deleteMessage = (messageId) => {
    if (socket && messageId) {
      socket.emit('deleteMessage', { messageId });
    }
  };

  // Listen for messageDeleted event
  useEffect(() => {
    if (!socket) return;
    const handler = ({ messageId }) => {
      setChatHistory(prevHistory => {
        const updated = { ...prevHistory };
        Object.keys(updated).forEach(uid => {
          updated[uid] = updated[uid].filter(m => m._id !== messageId && m.id !== messageId);
        });
        localStorage.setItem('chatHistory', JSON.stringify(updated));
        return updated;
      });
      setMessages(prev => prev.filter(m => m._id !== messageId && m.id !== messageId));
    };
    socket.on('messageDeleted', handler);
    return () => socket.off('messageDeleted', handler);
  }, [socket]);

  return { users, messages, sendMessage, selectUser, activeUser, deleteMessage };
}
