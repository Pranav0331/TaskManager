import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/constants';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Lock body scroll and listen for Escape key when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen, onClose]);

  // Handle navigation for mobile menu items: close sidebar first, then navigate
  const handleNavClick = useCallback(
    (path) => {
      onClose();
      if (location.pathname !== path) {
        navigate(path);
      }
    },
    [location.pathname, navigate, onClose]
  );

  const handleLogout = useCallback(() => {
    onClose();
    logout();
    navigate('/');
  }, [logout, navigate, onClose]);

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col h-screen bg-white dark:bg-nimbus-900 border-r border-nimbus-200 dark:border-nimbus-800 fixed left-0 top-0 z-30"
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-nimbus-200 dark:border-nimbus-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="font-semibold text-nimbus-900 dark:text-white tracking-tight">TaskFlow</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-semibold shadow-2xs'
                    : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 hover:text-nimbus-900 dark:hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="desktop-sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-nimbus-200 dark:border-nimbus-800 text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-300 transition-colors cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              key="mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-nimbus-950/60 dark:bg-black/80 backdrop-blur-xs z-40 lg:hidden"
              onClick={onClose}
              aria-label="Close menu backdrop"
            />

            {/* Slide-out Sidebar Drawer */}
            <motion.aside
              key="mobile-sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-[82vw] max-w-[320px] bg-white dark:bg-nimbus-900 shadow-2xl z-50 flex flex-col border-r border-nimbus-200 dark:border-nimbus-800 lg:hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation sidebar"
            >
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-nimbus-200 dark:border-nimbus-800 bg-white dark:bg-nimbus-900 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-xs">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-nimbus-900 dark:text-white tracking-tight">TaskFlow</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 rounded-lg text-nimbus-500 hover:text-nimbus-800 dark:hover:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items List */}
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-semibold shadow-xs'
                          : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 hover:text-nimbus-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* User Account / Footer */}
              {user && (
                <div className="p-4 border-t border-nimbus-200 dark:border-nimbus-800 bg-nimbus-50/70 dark:bg-nimbus-950/50 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                      {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-nimbus-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-nimbus-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;


