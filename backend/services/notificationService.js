import webpush from '../utils/webPush.js';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/User.js';

/**
 * Send a web push notification payload to all active subscriptions of a user
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {Object} payload
 * @returns {Promise<{ sent: number, failed: number, removed: number }>}
 */
export const sendPushToUser = async (userId, payload) => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('[Push] Skipping push: VAPID keys not configured in environment.');
    return { sent: 0, failed: 0, removed: 0 };
  }

  try {
    const subscriptions = await PushSubscription.find({ userId });
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0, removed: 0 };
    }

    const payloadString = JSON.stringify({
      title: payload.title || 'TaskFlow Notification',
      body: payload.body || '',
      icon: payload.icon || '/favicon.svg',
      badge: payload.badge || '/favicon.svg',
      tag: payload.tag || 'taskflow-notification',
      data: {
        url: payload.url || '/dashboard',
        taskId: payload.taskId || null,
        type: payload.type || 'general',
        ...(payload.data || {}),
      },
      timestamp: Date.now(),
      vibrate: [100, 50, 100],
      actions: payload.actions || [
        {
          action: 'open',
          title: 'Open App',
        },
      ],
    });

    let sent = 0;
    let failed = 0;
    let removed = 0;

    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscriptionObject = {
        endpoint: sub.endpoint,
        expirationTime: sub.expirationTime,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscriptionObject, payloadString, {
          TTL: 60 * 60 * 24, // 24 hours
        });
        sent++;
      } catch (error) {
        failed++;
        console.error(`[Push] Failed to send push to subscription ${sub._id}:`, error.statusCode || error.message);

        // HTTP 404 (Not Found) or 410 (Gone) indicates the subscription is expired or unsubscribed
        if (error.statusCode === 404 || error.statusCode === 410) {
          try {
            await PushSubscription.findByIdAndDelete(sub._id);
            removed++;
            console.log(`[Push] Removed expired subscription ${sub._id}`);
          } catch (deleteErr) {
            console.error(`[Push] Error removing subscription ${sub._id}:`, deleteErr.message);
          }
        }
      }
    });

    await Promise.allSettled(pushPromises);

    return { sent, failed, removed };
  } catch (error) {
    console.error(`[Push] Error in sendPushToUser:`, error);
    return { sent: 0, failed: 0, removed: 0, error: error.message };
  }
};

/**
 * Dispatch task-related push notifications based on user preferences
 * @param {Object} options
 * @param {string} options.type - 'assignment' | 'completed' | 'reminder' | 'overdue' | 'test'
 * @param {Object} options.task - Task mongoose document or object
 * @param {string} options.userId - Recipient user ID
 * @param {string} [options.initiatorName] - Optional name of the user triggering the action
 */
export const sendTaskNotification = async ({ type, task, userId, initiatorName }) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const prefs = user.notificationPreferences || {};
    // If master notifications disabled, exit
    if (prefs.enabled === false) return;

    let payload = null;

    switch (type) {
      case 'assignment':
        if (prefs.assignments === false) return;
        payload = {
          title: '📋 New Task Assigned',
          body: initiatorName
            ? `${initiatorName} assigned you task "${task.title}"`
            : `You have been assigned a new task: "${task.title}"`,
          tag: `task-assign-${task._id}`,
          type: 'assignment',
          taskId: task._id,
          url: `/tasks/${task._id}`,
          actions: [{ action: 'open_task', title: 'View Task' }],
        };
        break;

      case 'completed':
        if (prefs.completed === false) return;
        payload = {
          title: '🎉 Task Completed!',
          body: `Great job! "${task.title}" has been marked as Completed.`,
          tag: `task-completed-${task._id}`,
          type: 'completed',
          taskId: task._id,
          url: `/tasks/${task._id}`,
          actions: [{ action: 'open_task', title: 'View Task' }],
        };
        break;

      case 'reminder':
      case 'due_date':
        if (prefs.dueDates === false && prefs.reminders === false) return;
        payload = {
          title: '⏰ Task Due Soon',
          body: `"${task.title}" is due today or approaching its deadline.`,
          tag: `task-due-${task._id}`,
          type: 'due_date',
          taskId: task._id,
          url: `/tasks/${task._id}`,
          actions: [{ action: 'open_task', title: 'View Task' }],
        };
        break;

      case 'overdue':
        if (prefs.overdue === false) return;
        payload = {
          title: '⚠️ Task Overdue',
          body: `"${task.title}" is past its due date and still pending.`,
          tag: `task-overdue-${task._id}`,
          type: 'overdue',
          taskId: task._id,
          url: `/tasks/${task._id}`,
          actions: [{ action: 'open_task', title: 'View Task' }],
        };
        break;

      case 'test':
        payload = {
          title: '🔔 Test Notification from TaskFlow',
          body: 'Web push notifications are working smoothly on your device!',
          tag: 'taskflow-test',
          type: 'test',
          url: '/settings',
        };
        break;

      default:
        return;
    }

    if (payload) {
      await sendPushToUser(userId, payload);
    }
  } catch (error) {
    console.error(`[Push] Error in sendTaskNotification (${type}):`, error.message);
  }
};
