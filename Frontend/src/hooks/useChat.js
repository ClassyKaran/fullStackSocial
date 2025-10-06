
import { useQuery } from '@tanstack/react-query';
import * as chatApi from '../api/chat';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

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
        updatedHistory[partnerId] = [
          ...updatedHistory[partnerId],
          { ...message, sender: senderType, read: isActive }
        ];
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      // If the message is for the active user, update messages state
      if (activeUser && activeUser.id === partnerId) {
        setMessages((prev) => [...prev, { ...message, sender: senderType, read: true }]);
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
      userObj = users.find(u => u.id === userId) || { id: userId };
    }
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
      // Add message immediately to UI
      const newMessage = { from: myUserId, to: activeUser.id, text, sender: 'me' };
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

  return { users, messages, sendMessage, selectUser, activeUser };
}
