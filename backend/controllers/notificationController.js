// backend/controllers/notificationController.js
import Notification from "../models/Notification.js";

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate({
        path: 'data.postId',
        select: 'title status'
      })
      .populate({
        path: 'data.userId',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ message: err.message || "Failed to load notifications" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ message: err.message || "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    return res.status(500).json({ message: err.message || "Failed to mark notifications as read" });
  }
};

// Create notification (internal use)
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    throw err;
  }
};

// Utility function to send notifications based on type
export const sendNotification = async (type, recipientId, data = {}) => {
  const notificationTemplates = {
    // Student notifications
    new_application: {
      title: "New Tutor Application",
      message: `A tutor has submitted an application to your job: ${data.jobTitle || 'your post'}`,
      actionUrl: `/s/jobs/${data.postId}/applications`
    },
    interview_chat_opened: {
      title: "Interview Chat Opened",
      message: `You can now interview ${data.tutorName} for your job`,
      actionUrl: `/chat/${data.chatId}`
    },
    acceptance_confirmation: {
      title: "Tutor Accepted!",
      message: `${data.tutorName} has been accepted for your job. Schedule sessions now!`,
      actionUrl: `/s/schedule`
    },
    
    // Tutor notifications
    shortlisted: {
      title: "Application Shortlisted!",
      message: `Your application for "${data.jobTitle}" has been shortlisted. Start interviewing!`,
      actionUrl: `/chat/${data.chatId}`
    },
    accepted: {
      title: "Application Accepted!",
      message: `Congratulations! You've been selected for "${data.jobTitle}"`,
      actionUrl: `/t/students`
    },
    rejected: {
      title: "Application Status Update",
      message: `Your application for "${data.jobTitle}" was not selected this time`,
      actionUrl: `/t/applications`
    }
  };

  const template = notificationTemplates[type];
  if (!template) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  const notificationData = {
    recipient: recipientId,
    type,
    title: template.title,
    message: template.message,
    data: {
      ...data,
      actionUrl: template.actionUrl
    }
  };

  return await createNotification(notificationData);
};

// Delete old notifications (cleanup job)
export const cleanupNotifications = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      isRead: true,
      readAt: { $lt: thirtyDaysAgo }
    });

    return res.json({ 
      message: `Cleaned up ${result.deletedCount} old notifications` 
    });
  } catch (err) {
    console.error("cleanupNotifications error:", err);
    return res.status(500).json({ message: err.message || "Failed to cleanup notifications" });
  }
};
