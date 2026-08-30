import webpush from '../utils/webPush.js';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/User.js';

/**
 * Send a web push notification payload to ALL active push subscriptions of a user across all devices (Mac, iPhone, Android, PC, etc.)
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
      console.log(`[Push] No active subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0, removed: 0 };
    }

    console.log(`[Push] Delivering notification to ${subscriptions.length} registered device(s) for user ${userId}`);

    const payloadString = JSON.stringify({
      title: payload.title || 'TaskFlow Notification',
      body: payload.body || '',
      icon: payload.icon || '/favicon.svg',
      badge: payload.badge || '/favicon.svg',
      tag: payload.tag ? `${payload.tag}-${Date.now()}` : `taskflow-${Date.now()}`,
      renotify: true,
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
        console.error(`[Push] Delivery failed for subscription ${sub._id} (${sub.userAgent || 'unknown'}):`, error.statusCode || error.message);

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
    console.log(`[Push] Summary for user ${userId}: sent ${sent}/${subscriptions.length}, failed ${failed}, removed ${removed}`);

    return { sent, failed, removed };
  } catch (error) {
    console.error(`[Push] Error in sendPushToUser:`, error);
    return { sent: 0, failed: 0, removed: 0, error: error.message };
  }
};

/**
 * Dispatch task-related push notifications to all devices of target users
 * @param {Object} options
 * @param {string} options.type - 'created' | 'updated' | 'completed' | 'assignment' | 'reminder' | 'overdue' | 'deleted' | 'test'
 * @param {Object} options.task - Task mongoose document or object
 * @param {string|string[]} options.userId - Recipient user ID or array of user IDs
 * @param {string} [options.initiatorName] - Optional name of the user triggering the action
 * @param {string} [options.customMessage] - Optional custom message body
 */
export const sendTaskNotification = async ({ type, task, userId, initiatorName, customMessage }) => {
  try {
    const userIds = Array.isArray(userId) ? Array.from(new Set(userId)) : [userId];

    for (const uId of userIds) {
      if (!uId) continue;
      const user = await User.findById(uId);
      if (!user) continue;

      const prefs = user.notificationPreferences || {};
      // If master notifications disabled, exit
      if (prefs.enabled === false) continue;

      let payload = null;

      switch (type) {
        case 'created':
          if (prefs.created === false) continue;
          payload = {
            title: '✨ New Task Created',
            body: customMessage || `Task "${task.title}" has been created.`,
            tag: `task-created-${task._id}`,
            type: 'created',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'updated':
          if (prefs.updated === false) continue;
          payload = {
            title: '📝 Task Updated',
            body: customMessage || `"${task.title}" details have been updated.`,
            tag: `task-updated-${task._id}`,
            type: 'updated',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'assignment':
          if (prefs.assignments === false) continue;
          payload = {
            title: '📋 Task Assigned',
            body: customMessage || (initiatorName
              ? `${initiatorName} assigned you task "${task.title}"`
              : `You have been assigned task "${task.title}"`),
            tag: `task-assign-${task._id}`,
            type: 'assignment',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'completed':
          if (prefs.completed === false) continue;
          payload = {
            title: '🎉 Task Completed!',
            body: customMessage || `Great job! "${task.title}" has been marked as Completed.`,
            tag: `task-completed-${task._id}`,
            type: 'completed',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'reminder':
        case 'due_date':
          if (prefs.dueDates === false && prefs.reminders === false) continue;
          payload = {
            title: '⏰ Task Due Soon',
            body: customMessage || `"${task.title}" is due today or approaching its deadline.`,
            tag: `task-due-${task._id}`,
            type: 'due_date',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'overdue':
          if (prefs.overdue === false) continue;
          payload = {
            title: '⚠️ Task Overdue',
            body: customMessage || `"${task.title}" is past its due date and still pending.`,
            tag: `task-overdue-${task._id}`,
            type: 'overdue',
            taskId: task._id,
            url: `/tasks/${task._id}`,
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        case 'deleted':
          payload = {
            title: '🗑️ Task Deleted',
            body: `Task "${task.title}" was removed.`,
            tag: `task-deleted-${task._id}`,
            type: 'deleted',
            url: '/tasks',
          };
          break;

        case 'test':
          payload = {
            title: '🔔 Test Notification from TaskFlow',
            body: 'Web push notifications are working smoothly across all your devices!',
            tag: 'taskflow-test',
            type: 'test',
            url: '/settings',
          };
          break;

        default:
          continue;
      }

      if (payload) {
        await sendPushToUser(uId, payload);
      }
    }
  } catch (error) {
    console.error(`[Push] Error in sendTaskNotification (${type}):`, error.message);
  }
};
