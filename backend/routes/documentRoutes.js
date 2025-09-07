import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdminRole } from '../middleware/adminMiddleware.js';
import {
  getUserDocuments,
  getAllDocuments,
  deleteDocument,
  getDocumentStats
} from '../controllers/documentController.js';

const router = express.Router();

// Get documents for a specific user
router.get('/user/:userId', protect, getUserDocuments);

// Admin routes
router.get('/all', protect, requireAdminRole, getAllDocuments);
router.get('/stats', protect, requireAdminRole, getDocumentStats);
router.delete('/:documentId', protect, requireAdminRole, deleteDocument);

export default router;
