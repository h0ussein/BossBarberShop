import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAvailableSlots,
  getBookingStats,
} from '../controllers/bookingController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createBooking);
router.get('/available-slots/:barberId/:date', getAvailableSlots);

// Admin routes
router.get('/', protectAdmin, getBookings);
router.get('/stats', protectAdmin, getBookingStats);
router.get('/:id', protectAdmin, getBooking);
router.put('/:id', protectAdmin, updateBooking);
router.delete('/:id', protectAdmin, deleteBooking);

export default router;
