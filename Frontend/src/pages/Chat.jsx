import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

function Chat() {
  const { users, messages, sendMessage, selectUser, activeUser } = useChat();
  const [recentUsers, setRecentUsers] = useState([]);
  const [text, setText] = useState('');
  const [unread, setUnread] = useState({});
  // Unread count per user
  const [unreadCount, setUnreadCount] = useState({});
  const chatContainerRef = useRef(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (activeUser && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, activeUser]);

  // Update chatHistory from localStorage whenever a message is sent/received
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('chatHistory');
      if (saved) setChatHistory(JSON.parse(saved));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update chatHistory when messages change for active user
    if (activeUser) {
      setChatHistory(h => {
        const updated = { ...h, [activeUser.id]: messages };
        localStorage.setItem('chatHistory', JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, activeUser]);

  // Get current user ID
  const myId = localStorage.getItem('token') ? (() => {
    try {
      const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      return payload.id || payload.userId || '';
    } catch { return ''; }
  })() : '';

  // Persist recent users
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentChatUsers');
    if (savedRecent) setRecentUsers(JSON.parse(savedRecent));
  }, []);

  useEffect(() => {
    if (activeUser) {
      setUnread(u => ({ ...u, [activeUser.id]: false }));
      setUnreadCount(c => ({ ...c, [activeUser.id]: 0 }));
      setRecentUsers(prev => {
        const exists = prev.find(u => u.id === activeUser.id);
        if (!exists) {
          const newList = [{ ...activeUser }, ...prev.filter(u => u.id !== activeUser.id)];
          localStorage.setItem('recentChatUsers', JSON.stringify(newList));
          return newList;
        }
        return prev;
      });
    }
  }, [activeUser]);
  // Listen for new messages and update unread count
  useEffect(() => {
    // Count unread messages for each user
    const counts = {};
    Object.keys(chatHistory).forEach(uid => {
      counts[uid] = chatHistory[uid]?.filter(m => m.sender !== 'me' && !m.read)?.length || 0;
    });
    setUnreadCount(counts);
  }, [chatHistory, activeUser]);

  // Merge backend users and recent chat users
  const mergedUsers = React.useMemo(() => {
    const map = {};
    [...(users || []), ...(recentUsers || [])].forEach(u => {
      if (u && u.id) map[u.id] = u;
    });
    return Object.values(map);
  }, [users, recentUsers]);

  return (
    <div className="row" style={{ minHeight: 480 }}>
      <div className="col-md-4 border-end bg-white px-0" style={{ borderRadius: '12px 0 0 12px' }}>
        <div className="p-3 border-bottom">
          <h5 className="mb-0 text-primary">Users</h5>
        </div>
        <ul className="list-group list-group-flush">
          {mergedUsers?.map(user => (
            <li
              key={user.id}
              className={`list-group-item py-2 px-3${activeUser?.id === user.id ? ' active bg-light' : ''}`}
              onClick={() => selectUser(user)}
              style={{ cursor: 'pointer', border: 'none', borderRadius: activeUser?.id === user.id ? 8 : 0, position: 'relative' }}
            >
              <img
                src={user.profileImage ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}`}
                alt="Avatar"
                className="rounded-circle me-2"
                style={{ width: 32, height: 32, objectFit: 'cover', background: '#eee' }}
              />
              <span className={`fw-semibold text-dark${unread[user.id] ? ' fw-bold' : ''}`}>{user.username}</span>
              {/* Badge for unread messages */}
              {unreadCount[user.id] > 0 && (
                <span style={{ position: 'absolute', right: 18, top: 12, background: '#ed4956', color: '#fff', borderRadius: '50%', padding: '2px 8px', fontSize: 13, fontWeight: 600 }}>
                  {unreadCount[user.id]}
                </span>
              )}
              <div style={{ fontSize: 12 }}>
                <span className={user.online ? 'text-success' : 'text-muted'}>
                  {user.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <hr />
            </li>
          ))}
        </ul>
      </div>
      <div className="col-md-8 px-0" style={{ background: '#f7f7f9', borderRadius: '0 12px 12px 0' }}>
        <div className="d-flex flex-column h-100">
          <div className="p-3 border-bottom bg-white d-flex align-items-center">
            {activeUser && (
              <img
                src={activeUser.profileImage ? `${import.meta.env.VITE_API_BASE_URL}${activeUser.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.username || 'User')}`}
                alt="Avatar"
                className="rounded-circle me-2"
                style={{ width: 36, height: 36, objectFit: 'cover', background: '#eee' }}
              />
            )}
            <h6 className="mb-0 text-secondary">{activeUser ? ` ${activeUser.username || activeUser.id}` : 'Select a user to chat'}</h6>

          </div>
          <div
            className="flex-grow-1 px-3 py-2"
            style={{ overflowY: 'scroll', height: '280px' }}
            ref={chatContainerRef}
          >
            {activeUser && (!chatHistory[activeUser.id] || chatHistory[activeUser.id].length === 0) && <div className="text-muted text-center mt-5">No messages yet.</div>}
            {activeUser && chatHistory[activeUser.id]?.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-2 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`px-3 py-2 rounded-3 ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '70%', fontSize: 15 }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form
            className="p-3 border-top bg-white"
            onSubmit={e => {
              e.preventDefault();
              if (text.trim()) {
                sendMessage(text);
                setText('');
              }
            }}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
