import express from 'express';
import {
  getHomepageSections,
  getAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
} from '../controllers/homepageSectionController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getHomepageSections);

// Admin routes (protected)
router.get('/admin/all', protectAdmin, getAllHomepageSections);
router.post('/admin', protectAdmin, createHomepageSection);
router.put('/admin/reorder', protectAdmin, reorderHomepageSections);
router.put('/admin/:id', protectAdmin, updateHomepageSection);
router.delete('/admin/:id', protectAdmin, deleteHomepageSection);

export default router;
