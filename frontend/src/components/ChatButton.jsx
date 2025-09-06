import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import './ChatButton.css';

const ChatButton = ({ isStudent = true }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // This would come from actual API

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-button ${isChatOpen ? 'active' : ''}`}
        onClick={toggleChat}
        title="Open Chat"
      >
        <i className="fas fa-comments"></i>
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Chat Interface Modal */}
      {isChatOpen && (
        <div className="chat-modal">
          <div className="chat-modal-backdrop" onClick={() => setIsChatOpen(false)} />
          <div className="chat-modal-content">
            <ChatInterface 
              isStudent={isStudent}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
