import webpush from '../utils/webPush.js';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/User.js';

/**
 * Format a Date object into a readable date & time string
 * Example: "Aug 30, 2026 at 5:00 PM"
 */
export const formatNotificationDate = (date) => {
  if (!date) return 'No due date';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // If time is 00:00 (midnight / date-only input), only display date
    if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
      return datePart;
    }

    return `${datePart} at ${timePart}`;
  } catch (e) {
    return String(date);
  }
};

/**
 * Calculate human-readable overdue duration
 * Example: "2 hours", "3 days", "45 minutes"
 */
export const formatOverdueDuration = (dueDate) => {
  if (!dueDate) return 'recently';
  const diffMs = Date.now() - new Date(dueDate).getTime();
  if (diffMs <= 0) return 'a few moments';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  }
  return 'a few moments';
};

/**
 * Send a web push notification payload to ALL active push subscriptions of a user across all devices
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

    console.log(`[Push] Delivering notification "${payload.title}" to ${subscriptions.length} registered device(s) for user ${userId}`);

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
          title: 'Open Task',
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
 * Dispatch dynamic task-specific push notifications to all devices of target users
 * @param {Object} options
 * @param {string} options.type - 'created' | 'updated' | 'completed' | 'assignment' | 'reminder' | 'overdue' | 'deleted' | 'test'
 * @param {Object} options.task - Task mongoose document or object
 * @param {string|string[]} options.userId - Recipient user ID or array of user IDs
 * @param {string} [options.initiatorName] - Optional name of the user triggering the action
 * @param {string} [options.customMessage] - Optional custom message body override
 */
export const sendTaskNotification = async ({ type, task, userId, initiatorName, customMessage }) => {
  try {
    const userIds = Array.isArray(userId) ? Array.from(new Set(userId)) : [userId];
    const taskTitle = task?.title || 'Untitled Task';
    const formattedDueDate = task?.dueDate ? formatNotificationDate(task.dueDate) : null;

    for (const uId of userIds) {
      if (!uId) continue;
      const user = await User.findById(uId);
      if (!user) continue;

      const prefs = user.notificationPreferences || {};
      // If master notifications disabled, exit
      if (prefs.enabled === false) continue;

      let payload = null;

      switch (type) {
        // 1. Task Completed
        case 'completed':
          if (prefs.completed === false) continue;
          payload = {
            title: `✅ Task Completed — ${taskTitle}`,
            body: customMessage || 'You completed this task successfully.',
            tag: `task-completed-${task?._id || 'done'}`,
            type: 'completed',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 2. Due Date Reminder
        case 'reminder':
        case 'due_date':
          if (prefs.dueDates === false && prefs.reminders === false) continue;
          payload = {
            title: `⏰ Task Due Soon — ${taskTitle}`,
            body: customMessage || (formattedDueDate
              ? `Due: ${formattedDueDate}`
              : 'This task is approaching its deadline.'),
            tag: `task-due-${task?._id || 'due'}`,
            type: 'due_date',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 3. Overdue Task Warning
        case 'overdue':
          if (prefs.overdue === false) continue;
          const overdueDuration = task?.dueDate ? formatOverdueDuration(task.dueDate) : 'recently';
          payload = {
            title: `⚠️ Task Overdue — ${taskTitle}`,
            body: customMessage || (formattedDueDate
              ? `Overdue by ${overdueDuration} (Due: ${formattedDueDate})`
              : `This task is overdue by ${overdueDuration}.`),
            tag: `task-overdue-${task?._id || 'overdue'}`,
            type: 'overdue',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 4. Task Assignment
        case 'assignment':
          if (prefs.assignments === false) continue;
          payload = {
            title: `👤 New Task Assigned — ${taskTitle}`,
            body: customMessage || (initiatorName
              ? `Assigned to you by ${initiatorName}.`
              : 'You have been assigned this task.'),
            tag: `task-assign-${task?._id || 'assign'}`,
            type: 'assignment',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 5. Task Created
        case 'created':
          if (prefs.created === false) continue;
          payload = {
            title: `✨ New Task Created — ${taskTitle}`,
            body: customMessage || (formattedDueDate
              ? `Priority: ${task?.priority || 'Medium'} | Due: ${formattedDueDate}`
              : `Priority: ${task?.priority || 'Medium'}`),
            tag: `task-created-${task?._id || 'created'}`,
            type: 'created',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 6. Task Updated
        case 'updated':
          if (prefs.updated === false) continue;
          payload = {
            title: `📝 Task Updated — ${taskTitle}`,
            body: customMessage || (formattedDueDate
              ? `Status: ${task?.status || 'Pending'} | Priority: ${task?.priority || 'Medium'} | Due: ${formattedDueDate}`
              : `Status: ${task?.status || 'Pending'} | Priority: ${task?.priority || 'Medium'}`),
            tag: `task-updated-${task?._id || 'updated'}`,
            type: 'updated',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 7. Task Deleted
        case 'deleted':
          payload = {
            title: `🗑️ Task Deleted — ${taskTitle}`,
            body: customMessage || `Task "${taskTitle}" was removed.`,
            tag: `task-deleted-${task?._id || 'deleted'}`,
            type: 'deleted',
            url: '/tasks',
          };
          break;

        // 8. Subtask Created
        case 'subtask_created':
          if (prefs.created === false) continue;
          payload = {
            title: `✨ New Subtask Added — ${task?.subtask?.title || taskTitle}`,
            body: customMessage || `Added to parent task "${taskTitle}".`,
            tag: `subtask-created-${task?.subtask?._id || task?._id || 'subtask'}`,
            type: 'created',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 9. Subtask Updated
        case 'subtask_updated':
          if (prefs.updated === false) continue;
          payload = {
            title: `📝 Subtask Updated — ${task?.subtask?.title || taskTitle}`,
            body: customMessage || `Updated in parent task "${taskTitle}".`,
            tag: `subtask-updated-${task?.subtask?._id || task?._id || 'subtask'}`,
            type: 'updated',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 10. Subtask Completed
        case 'subtask_completed':
          if (prefs.completed === false) continue;
          payload = {
            title: `✅ Subtask Completed — ${task?.subtask?.title || taskTitle}`,
            body: customMessage || `Completed in parent task "${taskTitle}".`,
            tag: `subtask-completed-${task?.subtask?._id || task?._id || 'subtask'}`,
            type: 'completed',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 11. Subtask Due Soon
        case 'subtask_due_date':
          if (prefs.dueDates === false && prefs.reminders === false) continue;
          payload = {
            title: `⏰ Subtask Due Soon — ${task?.subtask?.title || taskTitle}`,
            body: customMessage || `Subtask in "${taskTitle}" is approaching its deadline.`,
            tag: `subtask-due-${task?.subtask?._id || task?._id || 'subtask'}`,
            type: 'due_date',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 12. Subtask Overdue
        case 'subtask_overdue':
          if (prefs.overdue === false) continue;
          payload = {
            title: `⚠️ Subtask Overdue — ${task?.subtask?.title || taskTitle}`,
            body: customMessage || `Subtask in "${taskTitle}" has passed its due date.`,
            tag: `subtask-overdue-${task?.subtask?._id || task?._id || 'subtask'}`,
            type: 'overdue',
            taskId: task?._id,
            url: task?._id ? `/tasks/${task._id}` : '/tasks',
            actions: [{ action: 'open_task', title: 'View Task' }],
          };
          break;

        // 13. Test Notification
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
