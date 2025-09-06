// frontend/src/pages/student/StudentMessages.jsx
import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import ChatWindow from '../../components/ChatWindow';
import api from '../../utils/api';
import './StudentMessages-modern.css';

const StudentMessages = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chat/rooms');
      setChatRooms(response.data || []);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
    // Refresh chat rooms every 30 seconds
    const interval = setInterval(fetchChatRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter chat rooms based on search
  const filteredChatRooms = chatRooms.filter(room =>
    room.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.post?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Open chat
  const openChat = (chatRoom) => {
    setSelectedChat(chatRoom);
  };

  // Close chat
  const closeChat = () => {
    setSelectedChat(null);
    fetchChatRooms(); // Refresh chat rooms to update last seen
  };

  return (
    <div className="student-messages-container">
      <StudentSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div className={`student-messages-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Messages & Chat</h1>
          <p>Communicate with tutors and manage conversations</p>
        </div>

        {/* Search */}
        <div className="messages-toolbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="refresh-btn"
            onClick={fetchChatRooms}
            disabled={loading}
            title="Refresh chats"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>

        {/* Chat List */}
        <div className="chat-rooms-container">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading && chatRooms.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading conversations...</span>
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No conversations yet</h3>
              <p>
                {searchTerm 
                  ? `No conversations found matching "${searchTerm}"`
                  : "When you shortlist tutors for your job posts, chat conversations will appear here."
                }
              </p>
            </div>
          ) : (
            <div className="chat-rooms-list">
              {filteredChatRooms.map((chatRoom) => (
                <div
                  key={chatRoom._id}
                  className={`chat-room-item ${chatRoom.unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => openChat(chatRoom)}
                >
                  {/* Tutor Avatar */}
                  <div className="tutor-avatar">
                    <span className="avatar-text">
                      {chatRoom.tutor?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                    {chatRoom.unreadCount > 0 && (
                      <div className="unread-badge">{chatRoom.unreadCount}</div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="chat-room-info">
                    <div className="chat-room-header">
                      <h4 className="tutor-name">
                        {chatRoom.tutor?.name || 'Unknown Tutor'}
                      </h4>
                      <span className="last-message-time">
                        {chatRoom.lastMessage 
                          ? formatTimeAgo(chatRoom.lastMessage.createdAt)
                          : formatTimeAgo(chatRoom.createdAt)
                        }
                      </span>
                    </div>
                    
                    <p className="job-title">
                      📚 {chatRoom.post?.title || 'Job Post'}
                    </p>
                    
                    {chatRoom.lastMessage ? (
                      <p className="last-message">
                        {chatRoom.lastMessage.text}
                      </p>
                    ) : (
                      <p className="last-message no-messages">
                        No messages yet - Start the conversation!
                      </p>
                    )}
                  </div>

                  {/* Chat Status */}
                  <div className="chat-status">
                    <div className={`chat-type-badge ${chatRoom.chatType}`}>
                      {chatRoom.chatType === 'interview' ? '🗣️ Interview' : '💬 Full Chat'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window Modal */}
      {selectedChat && (
        <ChatWindow
          chatId={selectedChat._id}
          chatType={selectedChat.chatType}
          tutorName={selectedChat.tutor?.name || 'Tutor'}
          postTitle={selectedChat.post?.title || 'Job Post'}
          onClose={closeChat}
          isOpen={true}
        />
      )}
    </div>
  );
};

export default StudentMessages;
