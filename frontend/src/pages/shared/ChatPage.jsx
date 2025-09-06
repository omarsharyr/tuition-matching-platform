// frontend/src/pages/shared/ChatPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import './ChatPage.css';

export default function ChatPage() {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Get current user
  const getCurrentUser = async () => {
    try {
      const response = await api.get('/profile');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  };

  // Load chat info and messages
  const load = async () => {
    try {
      // Get chat room info
      const chatResponse = await api.get(`/chat/${chatId}`);
      setChat(chatResponse.data);
      
      // Get messages separately
      const messagesResponse = await api.get(`/chat/${chatId}/messages`);
      setMessages(messagesResponse.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load chat");
    }
  };

  useEffect(() => {
    getCurrentUser();
    load();
    const t = setInterval(load, 3000); // Poll for new messages
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      await api.post(`/chat/${chatId}/message`, { text });
      setText("");
      await load(); // Refresh messages
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page-container">
      <div className="chat-page-card">
        {/* Header */}
        <div className="chat-page-header">
          <h2>💬 Chat Room</h2>
          {chat && (
            <div className="chat-info">
              <span>📚 {chat.post?.title || 'Discussion'}</span>
              {chat.chatType === 'interview' && <span className="badge interview">🗣️ Interview</span>}
              {chat.chatType === 'full' && <span className="badge full">💬 Full Chat</span>}
            </div>
          )}
        </div>

        {err && <div className="alert alert-danger">{err}</div>}
        
        {!chat ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading chat...</span>
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div className="welcome-message">
                    <h4>👋 Welcome to your chat!</h4>
                    <p>Start the conversation by sending a message below.</p>
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
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <form onSubmit={send} className="message-form">
                <div className="input-group">
                  <input
                    type="text"
                    className="message-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={loading || !text.trim()}
                  >
                    {loading ? '⏳' : '📤'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
