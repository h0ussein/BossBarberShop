# Web Push Notifications Setup Guide

This guide explains how web push notifications work in the BOSS Barbershop application.

## Overview

The application now supports web push notifications that alert barbers when new bookings are created, even when they're not actively using the website.

## How It Works

1. **User Permission**: When a barber logs in, they'll see a notification prompt on their dashboard
2. **Subscription**: Once they grant permission, their device is registered to receive push notifications
3. **Real-time Alerts**: When a customer books an appointment, the barber receives an instant notification
4. **Offline Support**: Notifications work even when the browser is closed (as long as the browser is running in the background)

## Technical Architecture

### Backend Components

1. **PushSubscription Model** (`models/PushSubscription.js`)
   - Stores push subscription data for each barber
   - Links subscriptions to barber accounts
   - Supports multiple devices per barber

2. **Push Notification Controller** (`controllers/pushNotificationController.js`)
   - Handles subscription/unsubscription requests
   - Sends push notifications using web-push library
   - Manages VAPID authentication

3. **Push Routes** (`routes/pushNotificationRoutes.js`)
   - `GET /api/push/vapid-public-key` - Get public VAPID key
   - `POST /api/push/subscribe` - Subscribe to notifications (requires barber auth)
   - `POST /api/push/unsubscribe` - Unsubscribe from notifications (requires barber auth)

4. **Integration with Booking Controller**
   - Automatically sends push notifications when new bookings are created
   - Runs in the background without blocking the response

### Frontend Components

1. **Service Worker** (`public/service-worker.js`)
   - Handles push events from the server
   - Displays notifications to the user
   - Manages notification clicks and actions

2. **Push Notification Utilities** (`utils/pushNotifications.js`)
   - Helper functions for managing subscriptions
   - Handles VAPID key conversion
   - Checks notification support and permissions

3. **NotificationPermission Component** (`components/NotificationPermission.jsx`)
   - UI component for requesting notification permission
   - Shows subscription status
   - Allows users to enable/disable notifications

4. **Service Worker Registration** (`main.jsx`)
   - Registers the service worker on app load
   - Required for push notifications to work

## Environment Variables

Add these to your `.env` file:

```env
# Web Push Notification VAPID Keys
VAPID_PUBLIC_KEY=BEP1vCjgU_WQyE9poF25y28K2HQQBVVXNzhbB-sJOLrDr-jKPT7A55nLotJszFoYzhVfn_9poHaXsD3LsoceTEc
VAPID_PRIVATE_KEY=N8F1olI8Yo0ZUPOOZ05U7we_rgwDl6xbmcop_ZwOyrw
```

**Note**: These keys are unique to your application. To generate new keys, run:
```bash
npx web-push generate-vapid-keys
```

## Testing Push Notifications

### 1. Development Testing

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Log in as a barber at `http://localhost:5173/barber/login`

4. You should see a notification permission prompt on the dashboard

5. Click "Enable Notifications" and accept the browser permission

6. Create a test booking (as a customer) to trigger a notification

### 2. Production Testing

1. Deploy your application with HTTPS (required for push notifications)

2. Log in as a barber

3. Enable notifications from the dashboard

4. Close the browser (notifications work in the background)

5. Create a booking from another device/browser

6. You should receive a notification on the barber's device

## Browser Support

Push notifications work on:
- ✅ Chrome (desktop & Android)
- ✅ Firefox (desktop & Android)
- ✅ Edge (desktop)
- ✅ Safari (macOS 16.4+, iOS 16.4+)
- ❌ Internet Explorer (not supported)

## Important Notes

1. **HTTPS Required**: Push notifications only work over HTTPS (except localhost)

2. **Service Worker Scope**: The service worker must be served from the root to work across all pages

3. **Permission Persistence**: Once granted, notification permission persists until the user manually revokes it

4. **Multiple Devices**: A barber can enable notifications on multiple devices

5. **Automatic Cleanup**: Invalid subscriptions are automatically removed when push fails

## Troubleshooting

### Notifications not appearing?

1. Check browser notification settings
2. Ensure service worker is registered (check DevTools > Application > Service Workers)
3. Verify VAPID keys are correctly set in .env
4. Check browser console for errors
5. Make sure the site is served over HTTPS in production

### "Permission denied" error?

- The user has blocked notifications for this site
- They need to manually enable it in browser settings
- Chrome: Settings > Privacy and Security > Site Settings > Notifications
- Firefox: Settings > Privacy & Security > Permissions > Notifications

### Service worker not registering?

1. Clear browser cache
2. Unregister old service workers (DevTools > Application > Service Workers)
3. Check that service-worker.js is accessible at `/service-worker.js`
4. Verify no JavaScript errors in console

## Security Considerations

1. **VAPID Keys**: Keep your private VAPID key secret (stored in .env)
2. **Authentication**: Only authenticated barbers can subscribe
3. **Data Validation**: All subscription data is validated server-side
4. **Automatic Cleanup**: Invalid subscriptions are removed automatically

## Future Enhancements

Potential improvements:
- Notification preferences (sound, vibration, etc.)
- Notification history
- Custom notification sounds
- Rich notifications with images
- Action buttons in notifications (Accept/Reject booking)
- Notification scheduling
- Push notification analytics

## Files Modified/Created

### Backend
- ✅ `models/PushSubscription.js` - New model
- ✅ `controllers/pushNotificationController.js` - New controller
- ✅ `routes/pushNotificationRoutes.js` - New routes
- ✅ `controllers/bookingController.js` - Updated to send push notifications
- ✅ `index.js` - Added push notification routes
- ✅ `.env` - Added VAPID keys

### Frontend
- ✅ `public/service-worker.js` - New service worker
- ✅ `src/utils/pushNotifications.js` - New utility functions
- ✅ `components/NotificationPermission.jsx` - New component
- ✅ `pages/barber/BarberDashboard.jsx` - Added notification component
- ✅ `main.jsx` - Registered service worker
- ✅ `public/manifest.json` - Updated for PWA support
- ✅ `vite.config.js` - Added service worker build config
