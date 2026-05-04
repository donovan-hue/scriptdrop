import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const StyledButton = styled(motion.button)`
  position: relative;
  overflow: hidden;
  
  /* Base Styles */
  padding: 14px 32px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  /* Glassmorphism */
  background: ${props => {
    switch (props.variant) {
      case 'primary':
        return 'linear-gradient(135deg, #b344ff 0%, #5b8fff 50%, #00d4ff 100%)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.18)';
      case 'success':
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)';
      case 'danger':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)';
      case 'ghost':
        return 'rgba(248, 249, 250, 0.5)';
      default:
        return 'linear-gradient(135deg, rgba(179, 68, 255, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%)';
    }
  }};
  
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  
  /* Text Color */
  color: ${props => {
    switch (props.variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#b344ff';
      case 'success':
        return '#22c55e';
      case 'danger':
        return '#ef4444';
      case 'ghost':
        return '#1a1a2e';
      default:
        return '#1a1a2e';
    }
  }};
  
  /* Shadow */
  box-shadow: ${props => props.variant === 'primary'
    ? '0 8px 24px rgba(179, 68, 255, 0.35)'
    : '0 8px 24px rgba(31, 38, 135, 0.1)'};
  
  /* Size Variants */
  ${props => {
    if (props.size === 'sm') return 'padding: 10px 20px; font-size: 14px;';
    if (props.size === 'lg') return 'padding: 18px 40px; font-size: 18px;';
    return '';
  }}
  
  /* Hover Effects */
  &:hover {
    backdrop-filter: blur(15px);
    border-color: ${props => {
      switch (props.variant) {
        case 'primary':
          return 'rgba(179, 68, 255, 0.6)';
        case 'secondary':
          return 'rgba(179, 68, 255, 0.4)';
        case 'success':
          return 'rgba(34, 197, 94, 0.4)';
        case 'danger':
          return 'rgba(239, 68, 68, 0.4)';
        default:
          return 'rgba(255, 255, 255, 0.5)';
      }
    }};
    box-shadow: ${props => {
      switch (props.variant) {
        case 'primary':
          return '0 0 30px rgba(179, 68, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3), 0 8px 32px rgba(179, 68, 255, 0.2)';
        case 'secondary':
          return '0 0 20px rgba(179, 68, 255, 0.2), 0 8px 32px rgba(31, 38, 135, 0.1)';
        case 'success':
          return '0 0 30px rgba(34, 197, 94, 0.4), 0 8px 32px rgba(31, 38, 135, 0.15)';
        case 'danger':
          return '0 0 30px rgba(239, 68, 68, 0.4), 0 8px 32px rgba(31, 38, 135, 0.15)';
        default:
          return '0 12px 40px rgba(31, 38, 135, 0.15)';
      }
    }};
  }
  
  /* Active State */
  &:active {
    transform: scale(0.95);
  }
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    backdrop-filter: blur(5px);
  }
  
  /* Full Width */
  ${props => props.fullWidth && 'width: 100%;'}
`;

const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {isLoading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⏳
        </motion.span>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default GlassButton;
