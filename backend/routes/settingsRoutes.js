import express from 'express';
import {
  getSettings,
  updateSettings,
  updateWorkingHours,
} from '../controllers/settingsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getSettings);

// Admin routes
router.put('/', protectAdmin, updateSettings);
router.put('/hours', protectAdmin, updateWorkingHours);

export default router;
