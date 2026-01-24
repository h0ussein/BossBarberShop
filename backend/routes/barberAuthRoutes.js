import express from 'express';
import {
  loginBarber,
  getBarberProfile,
  updateOwnSchedule,
  addOwnDayOff,
  removeOwnDayOff,
  getOwnBookings,
  updateBookingStatus,
  changePassword,
  updateOwnAvatar,
} from '../controllers/barberAuthController.js';
import { protectBarber } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/login', loginBarber);

// Protected (barber only)
router.get('/profile', protectBarber, getBarberProfile);
router.put('/schedule', protectBarber, updateOwnSchedule);
router.post('/dayoff', protectBarber, addOwnDayOff);
router.delete('/dayoff/:date', protectBarber, removeOwnDayOff);
router.get('/bookings', protectBarber, getOwnBookings);
router.put('/bookings/:id', protectBarber, updateBookingStatus);
router.put('/password', protectBarber, changePassword);
router.put('/avatar', protectBarber, updateOwnAvatar);

export default router;
