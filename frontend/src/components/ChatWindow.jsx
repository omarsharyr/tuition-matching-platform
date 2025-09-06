// frontend/src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import './ChatWindow-modern.css';

const ChatWindow = ({ 
  chatId, 
  chatType, 
  tutorName, 
  postTitle, 
  onClose,
  isOpen = false 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatExpiry, setChatExpiry] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Get current user info
  useEffect(() => {
    const userData = localStorage.getItem("user") || localStorage.getItem("authUser");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && chatId) {
      fetchMessages();
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      setMessages(response.data.messages || []);
      
      // Check expiry for interview chats
      if (response.data.chatType === 'interview' && response.data.expiresAt) {
        setChatExpiry(new Date(response.data.expiresAt));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/chat/${chatId}/message`, {
        text: newMessage
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const isExpired = chatExpiry && new Date() > chatExpiry;
  const timeRemaining = chatExpiry ? Math.max(0, chatExpiry - new Date()) : null;
  const daysRemaining = timeRemaining ? Math.floor(timeRemaining / (1000 * 60 * 60 * 24)) : null;

  if (!isOpen) return null;

  return (
    <div className="chat-window-overlay">
      <div className="chat-window">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-info">
            <h3>{chatType === 'interview' ? '🗣️ Interview Chat' : '💬 Full Chat'}</h3>
            <div className="chat-subtitle">
              <span>👨‍🏫 {tutorName}</span>
              <span className="separator">•</span>
              <span>📚 {postTitle}</span>
            </div>
            {chatType === 'interview' && daysRemaining !== null && (
              <div className="chat-expiry">
                {isExpired ? (
                  <span className="expired">⏰ Chat expired</span>
                ) : (
                  <span className="time-remaining">
                    ⏰ {daysRemaining} days remaining
                  </span>
                )}
              </div>
            )}
          </div>
          <button className="close-chat-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <div className="welcome-message">
                <h4>👋 Welcome to your {chatType} chat!</h4>
                <p>
                  {chatType === 'interview' 
                    ? "This is a 7-day interview chat. Use this time to discuss details and get to know each other."
                    : "This is your full chat room. You can communicate without any time restrictions."
                  }
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = currentUser && String(message.sender._id) === String(currentUser._id);
              return (
                <div
                  key={message._id}
                  className={`message ${isOwnMessage ? 'own' : 'other'}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {isOwnMessage ? 'You' : message.sender.name}
                      </span>
                      <span className="timestamp">
                        {formatTimestamp(message.createdAt)}
                      </span>
                    </div>
                    <p className="message-text">{message.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="chat-input-area">
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {isExpired ? (
            <div className="expired-message">
              ⏰ This interview chat has expired. Accept the application to continue chatting.
            </div>
          ) : (
            <form onSubmit={sendMessage} className="message-form">
              <div className="input-group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type your message to ${tutorName}...`}
                  disabled={loading}
                  className="message-input"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="send-button"
                >
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
