// backend/controllers/documentController.js
import Document from "../models/Document.js";
import User from "../models/User.js";

// Get documents for a specific user
export const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all documents for the user
    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      message: "Documents retrieved successfully",
      documents,
      count: documents.length
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    res.status(500).json({ 
      message: "Failed to fetch documents",
      error: error.message 
    });
  }
};

// Get all documents (admin only)
export const getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Document.countDocuments();

    res.json({
      message: "Documents retrieved successfully",
      documents,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: documents.length,
        totalDocuments: total
      }
    });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    res.status(500).json({ 
      message: "Failed to fetch documents",
      error: error.message 
    });
  }
};

// Delete a document (admin only)
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Optional: Delete physical file from filesystem
    // const fs = require('fs').promises;
    // const path = require('path');
    // try {
    //   await fs.unlink(path.join(__dirname, '..', '..', document.url));
    // } catch (fileError) {
    //   console.warn("Could not delete physical file:", fileError.message);
    // }

    await Document.findByIdAndDelete(documentId);

    res.json({
      message: "Document deleted successfully",
      deletedDocument: document
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ 
      message: "Failed to delete document",
      error: error.message 
    });
  }
};

// Get document statistics
export const getDocumentStats = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    
    const docsByType = await Document.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const docsByUser = await Document.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          count: 1,
          "user.name": 1,
          "user.email": 1,
          "user.role": 1
        }
      }
    ]);

    res.json({
      message: "Document statistics retrieved successfully",
      stats: {
        totalDocuments,
        documentsByType: docsByType,
        topUsersByDocCount: docsByUser
      }
    });
  } catch (error) {
    console.error("Error fetching document statistics:", error);
    res.status(500).json({ 
      message: "Failed to fetch document statistics",
      error: error.message 
    });
  }
};
