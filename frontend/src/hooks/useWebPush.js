import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notificationService';

/**
 * Utility function to convert base64 URL string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useWebPush = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    enabled: true,
    created: true,
    updated: true,
    dueDates: true,
    reminders: true,
    assignments: true,
    completed: true,
    overdue: true,
  });

  // Fetch list of registered devices
  const fetchDevices = useCallback(async () => {
    try {
      setDevicesLoading(true);
      const res = await notificationService.getRegisteredDevices();
      if (res?.data?.devices) {
        setDevices(res.data.devices);
        setActiveSubscriptionsCount(res.data.total || res.data.devices.length);
      }
    } catch (err) {
      console.error('[WebPush] Error fetching registered devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  // Check browser support and current subscription status
  const checkStatus = useCallback(async () => {
    try {
      const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(supported);

      if (!supported) {
        setLoading(false);
        return;
      }

      setPermission(Notification.permission);

      // Register or get existing service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      // Fetch user preferences and registered devices from backend
      try {
        const prefRes = await notificationService.getPreferences();
        if (prefRes?.data?.preferences) {
          setPreferences(prefRes.data.preferences);
        }
        if (prefRes?.data?.activeSubscriptionsCount !== undefined) {
          setActiveSubscriptionsCount(prefRes.data.activeSubscriptionsCount);
        }
        await fetchDevices();
      } catch (err) {
        // Quiet fallback if not logged in yet
      }
    } catch (error) {
      console.error('[WebPush] Error checking status:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Request permission and subscribe to web push
  const subscribeUser = async () => {
    if (!isSupported) {
      toast.error('Web Push is not supported on this browser/device.');
      return false;
    }

    setActionLoading(true);
    try {
      // 1. Request browser notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        if (perm === 'denied') {
          toast.error('Notification permission was blocked in browser settings.');
        } else {
          toast('Notification permission was dismissed.');
        }
        return false;
      }

      // 2. Ensure Service Worker is ready
      const registration = await navigator.serviceWorker.ready;

      // 3. Fetch VAPID public key from backend
      const keyRes = await notificationService.getVapidPublicKey();
      const vapidPublicKey = keyRes?.data?.publicKey;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not received from server');
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Subscribe with PushManager
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 5. Send subscription to backend
      await notificationService.subscribe(subscription);

      setIsSubscribed(true);
      toast.success('Push notifications enabled on this device!');
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('[WebPush] Subscription error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to enable notifications');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Unsubscribe from web push
  const unsubscribeUser = async () => {
    setActionLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await notificationService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled on this device.');
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('[WebPush] Unsubscribe error:', error);
      toast.error('Failed to unsubscribe from notifications');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Remove a specific device from backend
  const removeDevice = async (deviceId, endpoint) => {
    try {
      await notificationService.removeDevice(deviceId);
      toast.success('Device removed successfully');

      // If current device was removed, unsubscribe locally too
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub && sub.endpoint === endpoint) {
          await sub.unsubscribe();
          setIsSubscribed(false);
        }
      }

      await fetchDevices();
    } catch (error) {
      console.error('[WebPush] Error removing device:', error);
      toast.error(error.response?.data?.message || 'Failed to remove device');
    }
  };

  // Trigger test notification
  const sendTestNotification = async () => {
    setActionLoading(true);
    try {
      await notificationService.sendTestNotification();
      toast.success('Test notification dispatched to all registered devices!');
    } catch (error) {
      console.error('[WebPush] Test error:', error);
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setActionLoading(false);
    }
  };

  // Update a single notification preference
  const updatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await notificationService.updatePreferences(updated);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('[WebPush] Update preference error:', error);
      toast.error('Failed to save preference');
      // Rollback
      setPreferences(preferences);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    activeSubscriptionsCount,
    devices,
    devicesLoading,
    loading,
    actionLoading,
    preferences,
    subscribeUser,
    unsubscribeUser,
    removeDevice,
    fetchDevices,
    sendTestNotification,
    updatePreference,
    refreshStatus: checkStatus,
  };
};

export default useWebPush;
