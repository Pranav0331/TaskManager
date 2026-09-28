import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  Settings,
  Search,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/constants';
import { taskService } from '../../services/taskService';
import {
  generateNotificationsFromTasks,
  getReadNotificationIds,
} from '../../utils/notifications';
import NotificationPanel from './NotificationPanel';
import GlobalSearchModal from './GlobalSearchModal';

const TopBar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnreadNotifications = useCallback(async () => {
    try {
      const response = await taskService.getTasks({ sortBy: 'updatedAt', order: 'desc' });
      const items = generateNotificationsFromTasks(response.data || []);
      const readIds = getReadNotificationIds();
      const unread = items.filter((item) => !readIds.includes(item.id)).length;
      setUnreadCount(unread);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    checkUnreadNotifications();

    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };

    const handleTaskflowUpdated = () => {
      checkUnreadNotifications();
    };

    window.addEventListener('taskflow_notifications_read', handleNotificationsRead);
    window.addEventListener('taskflow_notifications_updated', handleTaskflowUpdated);

    // Periodic check every 60s
    const interval = setInterval(checkUnreadNotifications, 60000);

    return () => {
      window.removeEventListener('taskflow_notifications_read', handleNotificationsRead);
      window.removeEventListener('taskflow_notifications_updated', handleTaskflowUpdated);
      clearInterval(interval);
    };
  }, [checkUnreadNotifications]);

  // Global keyboard shortcut for Cmd+K (Mac) / Ctrl+K (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/85 dark:bg-nimbus-900/85 backdrop-blur-xl border-b border-nimbus-200 dark:border-nimbus-800">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-8">
          {/* Mobile hamburger menu & branding */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSidebar();
              }}
              className="lg:hidden p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-300 transition-colors cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-xs">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-nimbus-900 dark:text-white tracking-tight text-sm sm:text-base">
                TaskFlow
              </span>
            </div>
          </div>

          {/* Right Action Icons (Search, Notifications, Theme, Profile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search workspace (⌘K / Ctrl+K)"
              aria-label="Search"
              className="p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-500 hover:text-nimbus-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <GlobalSearchModal
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
            />

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  if (!notificationsOpen) {
                    setUnreadCount(0);
                  }
                }}
                title={
                  unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'Notifications'
                }
                className="p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-500 hover:text-nimbus-900 dark:hover:text-white relative transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && !notificationsOpen && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-nimbus-900 animate-pulse" />
                )}
              </button>

              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onMarkAllRead={() => setUnreadCount(0)}
              />
            </div>

            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-500 hover:text-nimbus-900 dark:hover:text-white transition-colors relative overflow-hidden cursor-pointer"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={darkMode ? 'dark' : 'light'}
                  initial={{ y: -8, opacity: 0, rotate: -60, scale: 0.7 }}
                  animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ y: 8, opacity: 0, rotate: 60, scale: 0.7 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center justify-center"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  ) : (
                    <Moon className="w-5 h-5 text-nimbus-600 dark:text-nimbus-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold shadow-2xs">
                  {getInitials(user?.name)}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] nimbus-card py-2 z-40 shadow-nimbus-xl border border-nimbus-200 dark:border-nimbus-800"
                    >
                      <div className="px-4 py-3 border-b border-nimbus-200 dark:border-nimbus-800">
                        <p className="text-sm font-semibold text-nimbus-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-nimbus-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-nimbus-700 dark:text-nimbus-300 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopBar;
