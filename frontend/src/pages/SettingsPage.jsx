import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Laptop,
  Tablet,
  Trash2,
  Loader2,
  PlusCircle,
  Edit3,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDateTime } from '../utils/constants';
import useWebPush from '../hooks/useWebPush';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const SettingsPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState(null);

  const {
    isSupported,
    permission,
    isSubscribed,
    activeSubscriptionsCount,
    devices,
    devicesLoading,
    loading: pushLoading,
    actionLoading,
    preferences,
    subscribeUser,
    unsubscribeUser,
    removeDevice,
    fetchDevices,
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

  const handleOpenDevicesModal = () => {
    fetchDevices();
    setDevicesModalOpen(true);
  };

  const handleRemoveDevice = async (device) => {
    setRemovingDeviceId(device.id);
    try {
      await removeDevice(device.id, device.endpoint);
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const getDeviceIcon = (deviceType, os) => {
    if (deviceType === 'mobile' || /iphone|android/i.test(os)) {
      return <Smartphone className="w-5 h-5 text-indigo-500" />;
    }
    if (deviceType === 'tablet' || /ipad/i.test(os)) {
      return <Tablet className="w-5 h-5 text-purple-500" />;
    }
    if (/mac/i.test(os)) {
      return <Laptop className="w-5 h-5 text-brand-500" />;
    }
    return <Monitor className="w-5 h-5 text-sky-500" />;
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
    if (permission === 'granted' && (isSubscribed || activeSubscriptionsCount > 0)) {
      const label =
        activeSubscriptionsCount > 1
          ? `Active on ${activeSubscriptionsCount} Devices`
          : 'Active & Subscribed';

      return (
        <button
          type="button"
          onClick={handleOpenDevicesModal}
          title="Click to view all registered devices"
          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
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

          {/* Test Notification Button & Manage Devices Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-medium text-nimbus-900 dark:text-white">Test Delivery</p>
              <p className="text-xs text-nimbus-500">Send an instant test alert to ALL your registered devices</p>
            </div>
            <div className="flex items-center gap-2">
              {activeSubscriptionsCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenDevicesModal}
                >
                  Manage Devices ({activeSubscriptionsCount})
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                disabled={!isSubscribed && activeSubscriptionsCount === 0}
                onClick={sendTestNotification}
                loading={actionLoading}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send Test Notification
              </Button>
            </div>
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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
                  disabled={!isSubscribed && activeSubscriptionsCount === 0}
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

      {/* Registered Devices Modal */}
      <Modal
        isOpen={devicesModalOpen}
        onClose={() => setDevicesModalOpen(false)}
        title="Registered Push Devices"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-nimbus-500">
            These devices are currently subscribed to receive real-time push notifications for your account.
          </p>

          {devicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 bg-nimbus-50 dark:bg-nimbus-800/40 rounded-xl p-6">
              <Smartphone className="w-8 h-8 text-nimbus-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-nimbus-700 dark:text-nimbus-300">
                No Registered Devices
              </p>
              <p className="text-xs text-nimbus-500 mt-1">
                Toggle "Enable Notifications" on this device or log in from another device to subscribe.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/50 border border-nimbus-200/70 dark:border-nimbus-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-nimbus-900 border border-nimbus-200 dark:border-nimbus-700 shadow-2xs">
                      {getDeviceIcon(device.deviceType, device.os)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-nimbus-900 dark:text-white truncate">
                          {device.deviceName}
                        </p>
                        {device.isCurrentDevice && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                            This Device
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-nimbus-500 mt-0.5">
                        Last Active: {formatDateTime(device.lastActiveAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={removingDeviceId === device.id}
                    onClick={() => handleRemoveDevice(device)}
                    title="Remove device subscription"
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 cursor-pointer ml-2 flex-shrink-0"
                  >
                    {removingDeviceId === device.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-nimbus-200 dark:border-nimbus-800">
            <Button variant="secondary" size="sm" onClick={() => setDevicesModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

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
              <div className="w-8 h-8 rounded-lg bg-nimbus-100 dark:bg-nimbus-800 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={darkMode ? 'dark' : 'light'}
                    initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {darkMode ? (
                      <Moon className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div>
                <p className="text-sm font-medium text-nimbus-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-nimbus-500">Toggle between light and dark themes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                darkMode ? 'bg-brand-600' : 'bg-nimbus-300'
              }`}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-xs"
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
