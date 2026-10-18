export const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const PRIORITY_COLORS = {
  Low: 'bg-nimbus-100 text-nimbus-600 dark:bg-nimbus-800 dark:text-nimbus-400',
  Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export const formatDate = (date) => {
  if (!date) return '—';
  if (typeof date === 'string') {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      const localDate = new Date(Number(y), Number(m) - 1, Number(d));
      return localDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Returns a local Date representing 23:59:59.999 on the due date.
 * Accurately parses ISO date strings (YYYY-MM-DD or full ISO) and Date instances
 * according to the user's local calendar day.
 */
export const getEndOfDueDay = (dueDate) => {
  if (!dueDate) return null;

  if (typeof dueDate === 'string') {
    const match = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
    }
  }

  const dateObj = new Date(dueDate);
  if (isNaN(dateObj.getTime())) return null;

  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    23,
    59,
    59,
    999
  );
};

/**
 * Determines whether a task or subtask is overdue.
 * A task is NOT overdue before its actual deadline.
 * If a task's due date is today, it is marked overdue only after 11:59 PM local time (next day 12:00 AM).
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  const endOfDay = getEndOfDueDay(dueDate);
  if (!endOfDay) return false;
  return new Date().getTime() > endOfDay.getTime();
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
