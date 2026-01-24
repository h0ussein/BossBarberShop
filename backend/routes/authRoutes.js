import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, updateProfile);

export default router;
