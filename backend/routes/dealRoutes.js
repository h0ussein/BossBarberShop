import express from 'express';
import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../controllers/dealController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - for Deals/Offers page
router.get('/', getDeals);

// Admin routes
router.post('/', protectAdmin, createDeal);
router.put('/:id', protectAdmin, updateDeal);
router.delete('/:id', protectAdmin, deleteDeal);

export default router;
