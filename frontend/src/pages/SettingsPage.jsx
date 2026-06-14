import { motion } from 'framer-motion';
import { Sun, Moon, User, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDateTime } from '../utils/constants';

const SettingsPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">Settings</h2>
        <p className="text-nimbus-500 mt-1">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
