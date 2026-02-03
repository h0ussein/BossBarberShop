import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useBarberAuth } from '../contexts/BarberAuthContext';
import {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
  getNotificationPermission,
} from '../utils/pushNotifications';

const NotificationPermission = () => {
  const { barberToken } = useBarberAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await isPushSubscribed();
      const currentPermission = getNotificationPermission();
      setIsSubscribed(subscribed);
      setPermission(currentPermission);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    setLoading(true);
    try {
      await subscribeToPushNotifications(barberToken);
      setIsSubscribed(true);
      setPermission('granted');
      toast.success('Push notifications enabled! You will now receive booking alerts.');
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      if (error.message.includes('permission denied')) {
        toast.error('Notification permission denied. Please enable it in your browser settings.');
      } else {
        toast.error('Failed to enable notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPushNotifications(barberToken);
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything if checking or if notifications are not supported
  if (checking) {
    return null;
  }

  if (!isPushNotificationSupported()) {
    return null;
  }

  // If permission is denied, show a message
  if (permission === 'denied') {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400">Notifications Blocked</h3>
            <p className="mt-1 text-xs text-red-300/80">
              You've blocked notifications. Please enable them in your browser settings to receive booking alerts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If already subscribed, show a success message with option to disable
  if (isSubscribed) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-400">Notifications Enabled</h3>
            <p className="mt-1 text-xs text-green-300/80">
              You'll receive push notifications for new bookings, even when the app is closed.
            </p>
            <button
              onClick={handleDisableNotifications}
              disabled={loading}
              className="mt-2 text-xs text-green-300/60 hover:text-green-300 disabled:opacity-50"
            >
              {loading ? 'Disabling...' : 'Disable notifications'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show enable notifications prompt
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
          <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-400">Enable Push Notifications</h3>
          <p className="mt-1 text-xs text-yellow-300/80">
            Get instant alerts when customers book appointments, even when you're not on the website.
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 transition hover:bg-yellow-500/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"></div>
                Enabling...
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enable Notifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;
