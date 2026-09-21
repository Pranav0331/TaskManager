import { AlertTriangle, Clock, CheckCheck, Sparkles } from 'lucide-react';
import { isOverdue, formatDate } from './constants';

const READ_NOTIFICATIONS_KEY = 'taskflow_read_notifications';

/**
 * Retrieve list of read notification IDs from localStorage
 */
export const getReadNotificationIds = () => {
  try {
    const data = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Mark specified notification IDs as read and notify listeners
 */
export const markNotificationsAsRead = (notificationIds) => {
  try {
    if (!notificationIds || notificationIds.length === 0) return;
    const current = getReadNotificationIds();
    const updated = Array.from(new Set([...current, ...notificationIds]));
    // Keep last 150 IDs to prevent excessive localStorage growth
    const trimmed = updated.slice(-150);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(
      new CustomEvent('taskflow_notifications_read', { detail: { readIds: trimmed } })
    );
  } catch (e) {
    console.error('Failed to save read notifications', e);
  }
};

/**
 * Generate sorted notification items from user's tasks
 */
export const generateNotificationsFromTasks = (tasks = []) => {
  const items = [];
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  tasks.forEach((task) => {
    // 1. Overdue alerts
    if (isOverdue(task.dueDate, task.status)) {
      items.push({
        id: `overdue-${task._id}`,
        taskId: task._id,
        type: 'overdue',
        title: `⚠️ Overdue: ${task.title}`,
        message: `Past deadline (${formatDate(task.dueDate)}). Action required.`,
        time: task.updatedAt || task.createdAt,
        icon: AlertTriangle,
        color: 'rose',
        priority: 1,
      });
    }

    // 2. Due today
    if (task.dueDate && task.status !== 'Completed') {
      const due = new Date(task.dueDate);
      if (due >= startOfToday && due <= endOfToday) {
        items.push({
          id: `due-${task._id}`,
          taskId: task._id,
          type: 'due_date',
          title: `⏰ Due Today: ${task.title}`,
          message: `Scheduled for completion today.`,
          time: task.updatedAt || task.createdAt,
          icon: Clock,
          color: 'amber',
          priority: 2,
        });
      }
    }

    // 3. Completed recently
    if (task.status === 'Completed') {
      items.push({
        id: `completed-${task._id}`,
        taskId: task._id,
        type: 'completed',
        title: `✅ Completed: ${task.title}`,
        message: `Marked as completed.`,
        time: task.updatedAt || task.createdAt,
        icon: CheckCheck,
        color: 'emerald',
        priority: 3,
      });
    } else {
      // 4. In progress / created
      items.push({
        id: `task-${task._id}`,
        taskId: task._id,
        type: 'created',
        title: `✨ Task: ${task.title}`,
        message: `Priority: ${task.priority} · Status: ${task.status}`,
        time: task.createdAt,
        icon: Sparkles,
        color: 'brand',
        priority: 4,
      });
    }
  });

  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);
};
