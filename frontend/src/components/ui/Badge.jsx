import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
