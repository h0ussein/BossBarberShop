import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  updatePasscode,
  fixAdminRecord,
} from '../controllers/adminAuthController.js';
import { protectAdmin, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);
// Temporary fix route
router.post('/fix', fixAdminRecord);

// Protected admin routes
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/passcode', protectAdmin, updatePasscode);

// Super admin only routes
router.post('/create', protectAdmin, superAdminOnly, createAdmin);
router.get('/all', protectAdmin, superAdminOnly, getAllAdmins);
router.put('/:id', protectAdmin, superAdminOnly, updateAdmin);
router.delete('/:id', protectAdmin, superAdminOnly, deleteAdmin);

export default router;
