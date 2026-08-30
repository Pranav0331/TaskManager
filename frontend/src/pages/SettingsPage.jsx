import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  User,
  Mail,
  Shield,
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  UserCheck,
  CheckCheck,
  Smartphone,
  Loader2,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDateTime } from '../utils/constants';
import useWebPush from '../hooks/useWebPush';
import Button from '../components/ui/Button';

const SettingsPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const {
    isSupported,
    permission,
    isSubscribed,
    activeSubscriptionsCount,
    loading: pushLoading,
    actionLoading,
    preferences,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification,
    updatePreference,
  } = useWebPush();

  const handleMasterToggle = async () => {
    if (isSubscribed) {
      await unsubscribeUser();
    } else {
      await subscribeUser();
    }
  };

  const getPermissionBadge = () => {
    if (!isSupported) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          Unsupported Browser
        </span>
      );
    }
    if (permission === 'granted' && isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {activeSubscriptionsCount > 1
            ? `Active on ${activeSubscriptionsCount} Devices`
            : 'Active & Subscribed'}
        </span>
      );
    }
    if (permission === 'denied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          Blocked in Browser
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        <Info className="w-3.5 h-3.5" />
        Permission Required
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">Settings</h2>
        <p className="text-nimbus-500 mt-1">Manage your account and preferences</p>
      </motion.div>

      {/* Web Push Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="nimbus-card"
      >
        <div className="px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white">
                Multi-Device Push Notifications
              </h3>
              <p className="text-xs text-nimbus-500">
                Dispatched to all your active devices (Mac, iPhone, Android, PC)
              </p>
            </div>
          </div>
          {getPermissionBadge()}
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Master Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-100 dark:border-nimbus-800/60">
            <div>
              <p className="text-sm font-semibold text-nimbus-900 dark:text-white">
                Enable Notifications on this Device
              </p>
              <p className="text-xs text-nimbus-500 mt-0.5">
                {isSubscribed
                  ? 'This device is registered and receives real-time task alerts'
                  : 'Allow this device to receive task updates and reminders'}
              </p>
            </div>

            <button
              type="button"
              disabled={!isSupported || actionLoading || pushLoading}
              onClick={handleMasterToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                isSubscribed ? 'bg-brand-600' : 'bg-nimbus-300 dark:bg-nimbus-700'
              }`}
            >
              {actionLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
              ) : (
                <motion.div
                  layout
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: isSubscribed ? '26px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Test Notification Button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium text-nimbus-900 dark:text-white">Test Delivery</p>
              <p className="text-xs text-nimbus-500">Send an instant test alert to ALL your registered devices</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={!isSubscribed || actionLoading}
              onClick={sendTestNotification}
              loading={actionLoading}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Test Notification
            </Button>
          </div>

          {/* Granular Preference Toggles */}
          <div className="pt-3 border-t border-nimbus-200 dark:border-nimbus-800">
            <h4 className="text-xs font-semibold text-nimbus-500 uppercase tracking-wider mb-3">
              Notification Triggers (Delivered to all devices)
            </h4>

            <div className="space-y-3">
              {/* Task Creation */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-4 h-4 text-sky-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Task Created
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Notify all devices whenever a new task is created
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.created !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('created', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Task Updates */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Task Updates
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Notify all devices when a task is edited or updated
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.updated !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('updated', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Completed Tasks */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Completed Tasks
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Receive celebration alerts across devices when tasks are marked Completed
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.completed !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('completed', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Assignments */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Task Assignments
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Notify when a task is assigned or reassigned
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.assignments !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('assignments', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Due Dates */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Due Date Alerts
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Get notified when tasks are due within 24 hours
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dueDates !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('dueDates', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Reminders */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Task Reminders
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Periodic background reminders for upcoming deadlines
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminders !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('reminders', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>

              {/* Overdue Tasks */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
                      Overdue Warnings
                    </p>
                    <p className="text-xs text-nimbus-500">
                      Alerts when tasks pass their due date without completion
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.overdue !== false}
                  disabled={!isSubscribed}
                  onChange={(e) => updatePreference('overdue', e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-nimbus-300 focus:ring-brand-500 dark:bg-nimbus-800 disabled:opacity-50 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* iOS & Mobile Safari Instructions Note */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs">
            <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-semibold">iPhone & Mobile Safari Support:</span> On iOS 16.4+, tap the
              Safari Share icon <span className="font-mono font-bold">[⎋]</span> &gt;{' '}
              <span className="font-semibold">"Add to Home Screen"</span>. Launch TaskFlow from your home screen
              to receive push notifications.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="nimbus-card"
      >
        <div className="px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800">
          <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white">Profile</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-nimbus-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-nimbus-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nimbus-50 dark:bg-nimbus-800/50">
              <User className="w-4 h-4 text-nimbus-400" />
              <div>
                <p className="text-xs text-nimbus-500">Full Name</p>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nimbus-50 dark:bg-nimbus-800/50">
              <Mail className="w-4 h-4 text-nimbus-400" />
              <div>
                <p className="text-xs text-nimbus-500">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nimbus-50 dark:bg-nimbus-800/50">
              <Shield className="w-4 h-4 text-nimbus-400" />
              <div>
                <p className="text-xs text-nimbus-500">Member Since</p>
                <p className="text-sm font-medium">{formatDateTime(user?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="nimbus-card"
      >
        <div className="px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800">
          <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white">Appearance</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-nimbus-400" /> : <Sun className="w-5 h-5 text-nimbus-400" />}
              <div>
                <p className="text-sm font-medium text-nimbus-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-nimbus-500">Toggle between light and dark themes</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-brand-600' : 'bg-nimbus-300'
              }`}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ left: darkMode ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
