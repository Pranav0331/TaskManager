import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = false,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Prevent background scroll when modal is open on mobile/desktop
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nimbus-950/60 dark:bg-black/75 backdrop-blur-xs"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`relative w-full ${sizes[size]} nimbus-card p-0 overflow-hidden shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] border border-nimbus-200 dark:border-nimbus-800 z-10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-nimbus-200 dark:border-nimbus-800 bg-white/80 dark:bg-nimbus-900/80 backdrop-blur-sm flex-shrink-0">
              <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-nimbus-900 dark:text-white truncate pr-2">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-nimbus-500 hover:text-nimbus-900 dark:hover:text-white hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form / Content Area */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
