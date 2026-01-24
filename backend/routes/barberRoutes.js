import express from 'express';
import {
  getBarbers,
  getBarber,
  createBarber,
  updateBarber,
  deleteBarber,
  updateBarberSchedule,
  getBarberSchedule,
  addDayOff,
  removeDayOff,
  updateBarberAvatar,
} from '../controllers/barberController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBarbers);
router.get('/:id', getBarber);
router.get('/:id/schedule', getBarberSchedule);

// Admin routes
router.post('/', protectAdmin, createBarber);
router.put('/:id', protectAdmin, updateBarber);
router.delete('/:id', protectAdmin, deleteBarber);
router.put('/:id/schedule', protectAdmin, updateBarberSchedule);
router.post('/:id/dayoff', protectAdmin, addDayOff);
router.delete('/:id/dayoff/:date', protectAdmin, removeDayOff);
router.put('/:id/avatar', protectAdmin, updateBarberAvatar);

export default router;
