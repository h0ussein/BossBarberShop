import express from 'express';
import { getAuthParams, deleteImage } from '../controllers/uploadController.js';
import { protectAdmin, protectBarber } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth endpoint for ImageKit (works for both admin and barber)
// We'll create a combined middleware
const protectAdminOrBarber = async (req, res, next) => {
  // Try admin auth first
  const adminToken = req.headers.authorization?.split(' ')[1];
  
  if (!adminToken) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  // Just verify the token exists and is valid for admin routes
  // The actual auth check will be done by the middleware
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(adminToken, process.env.JWT_SECRET);
    
    // Allow admin, super_admin, or barber roles
    if (['admin', 'super_admin', 'barber'].includes(decoded.role)) {
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized for uploads',
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
    });
  }
};

router.get('/auth', protectAdminOrBarber, getAuthParams);
router.delete('/:fileId', protectAdminOrBarber, deleteImage);

export default router;
