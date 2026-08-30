import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendTaskNotification } from './notificationService.js';

/**
 * Scan database for upcoming due dates and overdue tasks, and send push notifications
 */
export const checkTaskDeadlinesAndReminders = async () => {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Find tasks due within next 24 hours (not completed, reminder not sent recently)
    const upcomingTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: twentyFourHoursFromNow },
      $or: [
        { reminderSentAt: null },
        { reminderSentAt: { $lt: twentyFourHoursAgo } },
      ],
    });

    for (const task of upcomingTasks) {
      const recipientId = task.assignedTo || task.userId;
      if (recipientId) {
        await sendTaskNotification({
          type: 'due_date',
          task,
          userId: recipientId,
        });

        // Mark reminder timestamp to prevent repeat spam
        task.reminderSentAt = new Date();
        await task.save();
      }
    }

    // 2. Find overdue tasks (dueDate in past, not completed, overdue alert not sent recently)
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $lt: now },
      $or: [
        { overdueSentAt: null },
        { overdueSentAt: { $lt: twentyFourHoursAgo } },
      ],
    });

    for (const task of overdueTasks) {
      const recipientId = task.assignedTo || task.userId;
      if (recipientId) {
        await sendTaskNotification({
          type: 'overdue',
          task,
          userId: recipientId,
        });

        // Mark overdue timestamp to prevent repeat spam
        task.overdueSentAt = new Date();
        await task.save();
      }
    }

    if (upcomingTasks.length > 0 || overdueTasks.length > 0) {
      console.log(
        `[Scheduler] Processed notifications: ${upcomingTasks.length} upcoming reminders, ${overdueTasks.length} overdue alerts.`
      );
    }
  } catch (error) {
    console.error('[Scheduler] Error checking task deadlines:', error.message);
  }
};

/**
 * Initialize background cron job for automatic task push notifications
 */
export const startNotificationScheduler = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('[Scheduler] Running scheduled task notification check...');
    checkTaskDeadlinesAndReminders();
  });

  // Run once after initial startup (delay 5 seconds)
  setTimeout(() => {
    console.log('[Scheduler] Running initial task notification check on startup...');
    checkTaskDeadlinesAndReminders();
  }, 5000);

  console.log('✅ Task notification scheduler initialized (running every 15 minutes)');
};

export default startNotificationScheduler;
