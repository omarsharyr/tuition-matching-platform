import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import DashboardFrame from "../components/DashboardFrame";
import api from "../utils/api";
import "../styles/DashboardLayout.css";

export default function ChatRoom() {
  const { roomId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadChatData = async () => {
      setLoading(true);
      setError("");
      try {
        const [roomRes, messagesRes] = await Promise.all([
          api.get(`/chat/rooms/${roomId}`),
          api.get(`/chat/rooms/${roomId}/messages`)
        ]);
        setRoomInfo(roomRes.data);
        setMessages(messagesRes.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) loadChatData();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        message: newMessage.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardFrame role={userRole} title="Loading Chat...">
        <div className="skeleton" style={{ height: 400 }} />
      </DashboardFrame>
    );
  }

  if (error && !roomInfo) {
    return (
      <DashboardFrame role={userRole} title="Chat Error">
        <div className="auth-error">{error}</div>
      </DashboardFrame>
    );
  }

  const otherParticipant = roomInfo?.participants?.find(p => p._id !== user._id);

  return (
    <DashboardFrame role={userRole} title={`Chat with ${otherParticipant?.name || 'User'}`}>
      {error && <div className="auth-error" style={{ marginBottom: '12px' }}>{error}</div>}
      
      {/* Chat Header */}
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0', fontSize: '18px' }}>
              {otherParticipant?.name || 'Anonymous User'}
            </h3>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              {roomInfo?.post?.title ? `Regarding: ${roomInfo.post.title}` : 'Direct Message'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="panel" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender?._id === user._id;
              return (
                <div
                  key={msg._id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      background: isOwn ? '#1d4ed8' : '#fff',
                      color: isOwn ? '#fff' : '#111827',
                      border: isOwn ? 'none' : '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
                      {msg.message}
                    </p>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '11px', 
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input"
            style={{ flex: 1 }}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="btn primary"
            disabled={sending || !newMessage.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </DashboardFrame>
  );
}
