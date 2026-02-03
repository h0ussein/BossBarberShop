import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import Admin from '../models/Admin.js';

// Configure web-push with VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:' + process.env.FROM_EMAIL,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// @desc    Subscribe to push notifications
// @route   POST /api/push/subscribe
// @access  Private/Barber
export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
      });
    }

    // Get barber ID from authenticated admin
    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.barberId) {
      return res.status(404).json({
        success: false,
        message: 'Barber account not found',
      });
    }

    // Check if subscription already exists and update it, or create new one
    const existingSubscription = await PushSubscription.findOne({
      barberId: admin.barberId,
      endpoint: subscription.endpoint,
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.keys = subscription.keys;
      existingSubscription.userAgent = req.headers['user-agent'] || '';
      await existingSubscription.save();

      return res.json({
        success: true,
        message: 'Subscription updated successfully',
      });
    }

    // Create new subscription
    await PushSubscription.create({
      barberId: admin.barberId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed to push notifications successfully',
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
    });
  }
};

// @desc    Unsubscribe from push notifications
// @route   POST /api/push/unsubscribe
// @access  Private/Barber
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required',
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.barberId) {
      return res.status(404).json({
        success: false,
        message: 'Barber account not found',
      });
    }

    await PushSubscription.findOneAndDelete({
      barberId: admin.barberId,
      endpoint: endpoint,
    });

    res.json({
      success: true,
      message: 'Unsubscribed from push notifications successfully',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications',
    });
  }
};

// @desc    Get VAPID public key
// @route   GET /api/push/vapid-public-key
// @access  Public
export const getVapidPublicKey = async (req, res) => {
  try {
    if (!vapidKeys.publicKey) {
      return res.status(500).json({
        success: false,
        message: 'VAPID keys not configured',
      });
    }

    res.json({
      success: true,
      data: {
        publicKey: vapidKeys.publicKey,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get VAPID public key',
    });
  }
};

// Helper function to send push notification to a specific barber
export const sendPushToBarber = async (barberId, payload) => {
  try {
    // Get all subscriptions for this barber
    const subscriptions = await PushSubscription.find({ barberId });

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found for barber:', barberId);
      return;
    }

    // Send notification to all subscribed devices
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          JSON.stringify(payload)
        );
        console.log('Push notification sent successfully to:', sub.endpoint.substring(0, 50) + '...');
      } catch (error) {
        console.error('Failed to send push notification:', error.message);
        
        // If subscription is no longer valid, delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removing invalid subscription:', sub._id);
          await PushSubscription.findByIdAndDelete(sub._id);
        }
      }
    });

    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
};
