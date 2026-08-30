import PushSubscription from '../models/PushSubscription.js';
import User from '../models/User.js';
import { sendPushToUser, sendTaskNotification } from '../services/notificationService.js';
import { checkTaskDeadlinesAndReminders } from '../services/taskNotificationScheduler.js';

/**
 * @desc    Get VAPID Public Key for client-side subscription
 * @route   GET /api/notifications/vapid-public-key
 * @access  Public
 */
export const getVapidPublicKey = async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      success: false,
      message: 'VAPID public key not configured on server',
    });
  }

  res.json({
    success: true,
    data: {
      publicKey,
    },
  });
};

/**
 * @desc    Subscribe user browser to push notifications
 * @route   POST /api/notifications/subscribe
 * @access  Private
 */
export const subscribe = async (req, res) => {
  try {
    const { endpoint, expirationTime, keys, userAgent } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription object. Endpoint and keys (p256dh, auth) are required.',
      });
    }

    const userId = req.user._id;

    // Upsert subscription: update if endpoint exists, otherwise insert
    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId,
        endpoint,
        expirationTime: expirationTime || null,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent: userAgent || req.headers['user-agent'] || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Push notification subscription registered successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('[Notification Controller] Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register subscription',
    });
  }
};

/**
 * @desc    Unsubscribe device from push notifications
 * @route   POST /api/notifications/unsubscribe
 * @access  Private
 */
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required to unsubscribe',
      });
    }

    await PushSubscription.findOneAndDelete({
      userId: req.user._id,
      endpoint,
    });

    res.json({
      success: true,
      message: 'Push subscription removed successfully',
    });
  } catch (error) {
    console.error('[Notification Controller] Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove subscription',
    });
  }
};

/**
 * @desc    Send a test notification to the logged-in user
 * @route   POST /api/notifications/test
 * @access  Private
 */
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptionsCount = await PushSubscription.countDocuments({ userId });
    if (subscriptionsCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active push subscriptions found for your account on this device. Please enable notifications first.',
      });
    }

    const payload = {
      title: '🔔 Test Notification from TaskFlow',
      body: 'Web push notifications are working smoothly on your device!',
      tag: 'taskflow-test',
      type: 'test',
      url: '/settings',
      actions: [
        { action: 'open_settings', title: 'Open Settings' }
      ]
    };

    const result = await sendPushToUser(userId, payload);

    res.json({
      success: true,
      message: 'Test notification dispatched',
      data: result,
    });
  } catch (error) {
    console.error('[Notification Controller] Test notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test notification',
    });
  }
};

/**
 * @desc    Get user's notification preferences and subscription status
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    const subscriptionsCount = await PushSubscription.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        preferences: user?.notificationPreferences || {
          enabled: true,
          dueDates: true,
          reminders: true,
          assignments: true,
          completed: true,
          overdue: true,
        },
        hasActiveSubscription: subscriptionsCount > 0,
        activeSubscriptionsCount: subscriptionsCount,
      },
    });
  } catch (error) {
    console.error('[Notification Controller] Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get preferences',
    });
  }
};

/**
 * @desc    Update user's notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
export const updatePreferences = async (req, res) => {
  try {
    const { enabled, dueDates, reminders, assignments, completed, overdue } = req.body;

    const updateFields = {};
    if (enabled !== undefined) updateFields['notificationPreferences.enabled'] = enabled;
    if (dueDates !== undefined) updateFields['notificationPreferences.dueDates'] = dueDates;
    if (reminders !== undefined) updateFields['notificationPreferences.reminders'] = reminders;
    if (assignments !== undefined) updateFields['notificationPreferences.assignments'] = assignments;
    if (completed !== undefined) updateFields['notificationPreferences.completed'] = completed;
    if (overdue !== undefined) updateFields['notificationPreferences.overdue'] = overdue;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('notificationPreferences');

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error('[Notification Controller] Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update preferences',
    });
  }
};

/**
 * @desc    Manually trigger checking task deadlines (for immediate testing/admin)
 * @route   POST /api/notifications/check-deadlines
 * @access  Private
 */
export const triggerDeadlineCheck = async (req, res) => {
  try {
    await checkTaskDeadlinesAndReminders();
    res.json({
      success: true,
      message: 'Deadline and overdue checks executed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger deadline check',
    });
  }
};
