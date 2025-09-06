// backend/controllers/chatController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Application from "../models/Application.js";
import TuitionPost from "../models/TuitionPost.js";

// Get user's chat rooms
export const getChatRooms = async (req, res) => {
  try {
    const { jobId } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'student') {
      query.student = userId;
    } else if (userRole === 'tutor') {
      query.tutor = userId;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (jobId) {
      query.post = jobId;
    }

    const chatRooms = await Chat.find(query)
      .populate('post', 'title classLevel subjects status')
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .sort({ updatedAt: -1 });

    // Add last message info and unread count for each chat room
    const roomsWithMessages = await Promise.all(
      chatRooms.map(async (room) => {
        // Get last message for this chat
        const lastMessage = await Message.findOne({ chat: room._id })
          .populate('sender', 'name')
          .sort({ createdAt: -1 })
          .limit(1);

        // Get unread message count for current user
        const unreadCount = await Message.countDocuments({
          chat: room._id,
          sender: { $ne: userId },
          isRead: false
        });

        return {
          ...room.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    return res.json(roomsWithMessages);
  } catch (err) {
    console.error("getChatRooms error:", err);
    return res.status(500).json({ message: err.message || "Failed to load chat rooms" });
  }
};

// Create or get chat room (called when application is shortlisted)
export const createChatRoom = async (req, res) => {
  try {
    const { postId, tutorId } = req.body;
    
    const post = await TuitionPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Verify user has permission to create this chat
    const userId = req.user._id;
    const isStudent = String(post.student) === String(userId);
    const isTutor = String(tutorId) === String(userId);

    if (!isStudent && !isTutor) {
      return res.status(403).json({ message: "Not authorized to create this chat" });
    }

    // Check if application exists and is shortlisted or accepted
    const application = await Application.findOne({
      post: postId,
      tutor: tutorId,
      status: { $in: ['shortlisted', 'accepted'] }
    });

    if (!application) {
      return res.status(400).json({ 
        message: "Chat can only be created for shortlisted or accepted applications" 
      });
    }

    // Create or find existing chat room
    const chatRoom = await Chat.findOneAndUpdate(
      {
        post: postId,
        student: post.student,
        tutor: tutorId
      },
      {
        $setOnInsert: {
          post: postId,
          student: post.student,
          tutor: tutorId,
          participants: [
            { user: post.student, lastSeenAt: new Date(), unreadCount: 0 },
            { user: tutorId, lastSeenAt: new Date(), unreadCount: 0 }
          ]
        }
      },
      {
        upsert: true,
        new: true
      }
    ).populate('post', 'title classLevel subjects')
     .populate('student', 'name email')
     .populate('tutor', 'name email');

    return res.json(chatRoom);
  } catch (err) {
    console.error("createChatRoom error:", err);
    return res.status(500).json({ message: err.message || "Failed to create chat room" });
  }
};

// Get single chat room with messages
export const getChatRoom = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const chat = await Chat.findById(chatId)
      .populate('post', 'title classLevel subjects status')
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!chat) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Verify user has access to this chat
    const userId = String(req.user._id);
    if (![String(chat.student._id), String(chat.tutor._id)].includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages with pagination (most recent first, but return in chronological order)
    const skip = (page - 1) * limit;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    // Mark messages as read for current user
    await Message.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { isRead: true }
    );

    // Get total message count
    const totalMessages = await Message.countDocuments({ chat: chatId });

    return res.json({
      _id: chat._id,
      post: chat.post,
      student: chat.student,
      tutor: chat.tutor,
      chatType: chat.chatType,
      expiresAt: chat.expiresAt,
      messages: chronologicalMessages,
      pagination: {
        current: parseInt(page),
        hasMore: skip + messages.length < totalMessages,
        totalMessages
      },
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    });
  } catch (err) {
    console.error("getChatRoom error:", err);
    return res.status(500).json({ message: err.message || "Failed to load chat room" });
  }
};

// Send message to chat room
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, attachments = [] } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findById(chatId)
      .populate('student', 'name')
      .populate('tutor', 'name');

    if (!chat) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Verify user belongs to this chat
    const userId = String(req.user._id);
    if (![String(chat.student._id), String(chat.tutor._id)].includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if chat is expired (for interview chats)
    if (chat.chatType === 'interview' && chat.expiresAt && new Date() > chat.expiresAt) {
      return res.status(400).json({ message: "This interview chat has expired" });
    }

    // Create new message in Messages collection
    const newMessage = new Message({
      chat: chatId,
      sender: userId,
      text: text.trim(),
      attachments
    });

    await newMessage.save();

    // Populate sender information
    await newMessage.populate('sender', 'name email');

    // Update chat's last message and timestamp
    chat.lastMessage = {
      text: text.trim(),
      sender: userId,
      createdAt: new Date()
    };
    chat.updatedAt = new Date();
    await chat.save();

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ message: err.message || "Failed to send message" });
  }
};

// Get messages for a chat room (alternative endpoint for real-time updates)
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { since, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Verify access
    const userId = String(req.user._id);
    if (![String(chat.student), String(chat.tutor)].includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build query for messages
    let messageQuery = { chat: chatId };

    // Filter messages since timestamp if provided
    if (since) {
      const sinceDate = new Date(since);
      messageQuery.createdAt = { $gt: sinceDate };
    }

    // Get messages with sender info
    const messages = await Message.find(messageQuery)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Return in chronological order
    const chronologicalMessages = messages.reverse();

    return res.json(chronologicalMessages);
  } catch (err) {
    console.error("getChatMessages error:", err);
    return res.status(500).json({ message: err.message || "Failed to load messages" });
  }
};
