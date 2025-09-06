import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatInterface.css';

const ChatInterface = ({ isStudent = true, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        userId: currentUser.id,
        userType: isStudent ? 'student' : 'tutor'
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    newSocket.on('message_received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('typing_start', ({ userId, userName }) => {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, userName }]);
    });

    newSocket.on('typing_stop', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    newSocket.on('user_online', (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    // Load conversations
    loadConversations();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/chat/conversations');
      // setConversations(response.data);
      
      // Mock data for now
      const mockConversations = [
        {
          id: 1,
          participant: {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            profileImage: null,
            role: isStudent ? 'tutor' : 'student',
            isOnline: true
          },
          lastMessage: {
            content: 'Hi, are you available for mathematics tutoring?',
            timestamp: new Date(Date.now() - 30000),
            senderId: 2
          },
          unreadCount: 2
        },
        {
          id: 2,
          participant: {
            id: 3,
            firstName: 'Jane',
            lastName: 'Smith',
            profileImage: null,
            role: isStudent ? 'tutor' : 'student',
            isOnline: false
          },
          lastMessage: {
            content: 'Thank you for the great session!',
            timestamp: new Date(Date.now() - 3600000),
            senderId: currentUser.id
          },
          unreadCount: 0
        }
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0]);
        loadMessages(mockConversations[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      // setMessages(response.data);
      
      // Mock messages
      const mockMessages = [
        {
          id: 1,
          content: 'Hi, are you available for mathematics tutoring?',
          senderId: 2,
          senderName: 'John Doe',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: 2,
          content: 'Yes, I\'m available! What topics would you like to cover?',
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          timestamp: new Date(Date.now() - 3300000),
          type: 'text'
        },
        {
          id: 3,
          content: 'I need help with calculus, specifically derivatives.',
          senderId: 2,
          senderName: 'John Doe',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text'
        },
        {
          id: 4,
          content: 'Perfect! I have extensive experience with calculus. When would you like to start?',
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          timestamp: new Date(Date.now() - 2700000),
          type: 'text'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation.id,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date()
    };

    // Optimistically add message to UI
    const optimisticMessage = {
      id: Date.now(),
      content: messageData.content,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      timestamp: messageData.timestamp,
      type: messageData.type
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // Send via socket
      socket?.emit('send_message', messageData);
      
      // TODO: Also save to database via API
      // await api.post('/chat/messages', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (!socket || !activeConversation) return;

    socket.emit('typing_start', {
      conversationId: activeConversation.id,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: activeConversation.id,
        userId: currentUser.id
      });
    }, 2000);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.participant.firstName} ${conv.participant.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="chat-interface">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>
            <i className="fas fa-comments"></i>
            Messages
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Search */}
        <div className="chat-search">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Connection Status */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <i className={`fas fa-circle ${isConnected ? 'text-green' : 'text-red'}`}></i>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <i className="fas fa-inbox"></i>
              <p>No conversations yet</p>
              <small>Start messaging tutors to see your chats here</small>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveConversation(conversation);
                  loadMessages(conversation.id);
                }}
              >
                <div className="conversation-avatar">
                  <img
                    src={conversation.participant.profileImage || 
                         `https://ui-avatars.com/api/?name=${conversation.participant.firstName}+${conversation.participant.lastName}&size=48`}
                    alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                  />
                  {conversation.participant.isOnline && <div className="online-indicator"></div>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">
                    {conversation.participant.firstName} {conversation.participant.lastName}
                    <span className="role-badge">{conversation.participant.role}</span>
                  </div>
                  <div className="last-message">
                    {conversation.lastMessage.content}
                  </div>
                  <div className="conversation-time">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </div>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="unread-badge">{conversation.unreadCount}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-conversation-header">
              <div className="participant-info">
                <img
                  src={activeConversation.participant.profileImage || 
                       `https://ui-avatars.com/api/?name=${activeConversation.participant.firstName}+${activeConversation.participant.lastName}&size=40`}
                  alt={`${activeConversation.participant.firstName} ${activeConversation.participant.lastName}`}
                />
                <div>
                  <h3>{activeConversation.participant.firstName} {activeConversation.participant.lastName}</h3>
                  <span className={`status ${activeConversation.participant.isOnline ? 'online' : 'offline'}`}>
                    {activeConversation.participant.isOnline ? 'Online' : 'Last seen recently'}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn" title="Voice Call">
                  <i className="fas fa-phone"></i>
                </button>
                <button className="action-btn" title="Video Call">
                  <i className="fas fa-video"></i>
                </button>
                <button className="action-btn" title="More Options">
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === currentUser.id ? 'own' : 'other'}`}
                >
                  {message.senderId !== currentUser.id && (
                    <img
                      src={`https://ui-avatars.com/api/?name=${message.senderName}&size=32`}
                      alt={message.senderName}
                      className="message-avatar"
                    />
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">
                    {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <div className="message-input-wrapper">
                <button className="attachment-btn" title="Attach File">
                  <i className="fas fa-paperclip"></i>
                </button>
                <textarea
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />
                <button 
                  className="send-btn" 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="no-conversation-content">
              <i className="fas fa-comments"></i>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
