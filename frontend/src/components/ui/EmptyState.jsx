import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-nimbus-100 dark:bg-nimbus-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-nimbus-400" />
      </div>
      <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-nimbus-500 dark:text-nimbus-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
