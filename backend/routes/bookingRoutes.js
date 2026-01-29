import express from 'express';
import rateLimit from 'express-rate-limit';
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

// Rate limiter for booking creation only
const bookingCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bookings per hour per IP
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/', bookingCreationLimiter, createBooking);
router.get('/available-slots/:barberId/:date', getAvailableSlots);

// Admin routes
router.get('/', protectAdmin, getBookings);
router.get('/stats', protectAdmin, getBookingStats);
router.get('/:id', protectAdmin, getBooking);
router.put('/:id', protectAdmin, updateBooking);
router.delete('/:id', protectAdmin, deleteBooking);

export default router;
