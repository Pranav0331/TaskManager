import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { formatDateTime } from '../../utils/constants';
import {
  generateNotificationsFromTasks,
  markNotificationsAsRead,
} from '../../utils/notifications';

const NotificationPanel = ({ isOpen, onClose, onMarkAllRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await taskService.getTasks({ sortBy: 'updatedAt', order: 'desc' });
        const items = generateNotificationsFromTasks(response.data || []);
        setNotifications(items);

        // Immediately mark visible notifications as read
        if (items.length > 0) {
          markNotificationsAsRead(items.map((n) => n.id));
        }
        onMarkAllRead?.();
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen, onMarkAllRead]);

  const getColorClasses = (color) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
      case 'amber':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      default:
        return 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-200 dark:border-brand-900/50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 nimbus-card p-0 z-30 shadow-nimbus-xl overflow-hidden border border-nimbus-200 dark:border-nimbus-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-nimbus-200 dark:border-nimbus-800 bg-nimbus-50/50 dark:bg-nimbus-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-semibold text-nimbus-900 dark:text-white">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/settings"
                  onClick={onClose}
                  title="Notification Settings"
                  className="p-1 rounded-lg text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-84 overflow-y-auto divide-y divide-nimbus-100 dark:divide-nimbus-800/60">
              {loading ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-nimbus-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-nimbus-100 dark:bg-nimbus-800 flex items-center justify-center mx-auto mb-2 text-nimbus-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                    All caught up!
                  </p>
                  <p className="text-xs text-nimbus-400 mt-0.5">
                    No urgent task alerts or deadlines pending.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={`/tasks/${item.taskId}`}
                      onClick={onClose}
                      className="flex items-start gap-3 p-3.5 hover:bg-nimbus-50/80 dark:hover:bg-nimbus-800/50 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${getColorClasses(item.color)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-nimbus-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {item.title}
                          </p>
                          <ExternalLink className="w-3 h-3 text-nimbus-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-xs text-nimbus-500 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-nimbus-400 mt-1">
                          {formatDateTime(item.time)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-nimbus-50 dark:bg-nimbus-900/70 border-t border-nimbus-200 dark:border-nimbus-800 flex items-center justify-between text-xs">
              <Link
                to="/tasks"
                onClick={onClose}
                className="text-nimbus-600 dark:text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium"
              >
                View all tasks
              </Link>
              <Link
                to="/settings"
                onClick={onClose}
                className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Push settings
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
