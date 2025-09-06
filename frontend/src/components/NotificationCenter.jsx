// frontend/src/components/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './NotificationCenter-modern.css';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle notification click for navigation
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type and data
    if (notification.data) {
      if (notification.data.chatId) {
        // Open chat - this would need proper chat page routing
        console.log('Open chat:', notification.data.chatId);
      } else if (notification.data.postId) {
        // Navigate to applications for that post
        navigate(`/s/applications?post=${notification.data.postId}`);
      } else if (notification.data.applicationId) {
        // Navigate to applications page
        navigate('/s/applications');
      }
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📋';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      case 'tutor_shortlisted':
        return '⭐';
      case 'tutor_accepted':
        return '✅';
      case 'application_received':
        return '📨';
      default:
        return '🔔';
    }
  };

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

  // Get filtered notifications
  const filteredNotifications = showViewAll 
    ? notifications 
    : notifications.slice(0, 10);

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="notification-header">
        <div className="notification-title">
          <h3>
            <span className="notification-bell">🔔</span>
            Notifications
          </h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <span className="notification-counter">{unreadCount}</span>
            )}
            {unreadCount > 0 && (
              <button 
                className="action-btn" 
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                Mark Read
              </button>
            )}
            <button 
              className="action-btn" 
              onClick={() => setShowViewAll(!showViewAll)}
              title={showViewAll ? 'Show recent' : 'View all'}
            >
              {showViewAll ? 'Recent' : 'View All'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="notification-content">
        {loading ? (
          <div className="notifications-loading">
            <div className="loading-spinner"></div>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">🔔</div>
            <h4 className="empty-title">No notifications yet</h4>
            <p className="empty-description">
              When you receive new applications, messages, or updates, they'll appear here.
            </p>
          </div>
        ) : (
          <ul className="notification-list">
            {filteredNotifications.map((notification) => (
              <li
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`notification-icon ${notification.type}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-body">
                  <p className="notification-text">
                    {notification.message}
                  </p>
                  
                  <div className="notification-meta">
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <span className={`notification-type-badge ${notification.type}`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  className="delete-notification-btn"
                  onClick={(e) => deleteNotification(notification._id, e)}
                  title="Delete notification"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
