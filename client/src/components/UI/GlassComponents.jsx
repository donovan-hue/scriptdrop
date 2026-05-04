import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/glassmorphism.css';

/**
 * GlassCard Component
 * Tarjeta con efecto glassmorphism
 */
export const GlassCard = ({
  children,
  className = '',
  variant = 'default', // default, primary, secondary
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={`glass-card ${variant !== 'default' ? `glass-card.${variant}` : ''} ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * GlassButton Component
 * Botón mejorado con glassmorphism
 */
export const GlassButton = ({
  children,
  className = '',
  variant = 'default', // default, primary, secondary
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon,
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      className={`glass-btn ${variant !== 'default' ? `glass-btn.${variant}` : ''} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin">⏳</span>
      ) : icon ? (
        <>
          {icon} {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

/**
 * GlassInput Component
 * Input con glassmorphism
 */
export const GlassInput = React.forwardRef(
  ({ className = '', icon, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref}
            className={`glass-input w-full ${icon ? 'pl-10' : 'pl-4'} ${error ? 'border-red-500' : ''} ${className}`}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

/**
 * GlassModal Component
 * Modal con efecto glassmorphism
 */
export const GlassModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md' // sm, md, lg
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <motion.div
      className="glass-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`glass-modal ${sizeClasses[size]}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

GlassModal.displayName = 'GlassModal';

/**
 * GlassBadge Component
 * Badge con glassmorphism
 */
export const GlassBadge = ({
  children,
  variant = 'default',
  className = ''
}) => {
  return (
    <span
      className={`glass-badge ${variant !== 'default' ? `glass-badge.${variant}` : ''} ${className}`}
    >
      {children}
    </span>
  );
};

/**
 * GlassNotification Component
 * Notificación con glassmorphism
 */
export const GlassNotification = ({
  message,
  type = 'info', // info, success, warning, error
  autoClose = true,
  duration = 3000,
  onClose
}) => {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <motion.div
      className={`glass-card ${typeStyles[type]} text-white p-4 rounded-xl fixed bottom-4 right-4 max-w-sm`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {message}
    </motion.div>
  );
};

/**
 * GlassAvatar Component
 * Avatar con glassmorphism
 */
export const GlassAvatar = ({
  src,
  fallback,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  return (
    <div className={`glass-avatar ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt="avatar" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

/**
 * GlassSkeletonLoader Component
 * Skeleton loader con glassmorphism
 */
export const GlassSkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="glass-card h-24"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};
