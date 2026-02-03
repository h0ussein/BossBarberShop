import express from 'express';
import { subscribe, unsubscribe, getVapidPublicKey } from '../controllers/pushNotificationController.js';
import { protectBarber } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Protected barber routes
router.post('/subscribe', protectBarber, subscribe);
router.post('/unsubscribe', protectBarber, unsubscribe);

export default router;
