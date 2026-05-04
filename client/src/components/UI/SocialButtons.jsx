import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaApple, FaGoogle, FaFacebook } from 'react-icons/fa';

const SocialButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const StyledSocialButton = styled(motion.button)`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(
    135deg,
    rgba(248, 249, 250, 0.8) 0%,
    rgba(232, 238, 245, 0.6) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;
  color: #1a1a2e;
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.1);
  
  /* Border Gradient */
  background-image: 
    linear-gradient(
      135deg,
      rgba(248, 249, 250, 0.8) 0%,
      rgba(232, 238, 245, 0.6) 100%
    ),
    linear-gradient(
      135deg,
      rgba(255, 110, 199, 0.3) 0%,
      rgba(0, 212, 255, 0.3) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 1.5px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    backdrop-filter: blur(15px);
    box-shadow: 
      0 0 20px rgba(255, 110, 199, 0.3),
      0 0 30px rgba(0, 212, 255, 0.2),
      0 12px 40px rgba(31, 38, 135, 0.15);
    border-color: rgba(255, 110, 199, 0.4);
  }
  
  &:active {
    transform: translateY(-2px) scale(0.95);
  }
  
  /* Shine Effect on Hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    border-radius: 50%;
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const SocialButtons = ({ onApple, onGoogle, onFacebook }) => {
  const buttons = [
    {
      id: 'apple',
      icon: FaApple,
      onClick: onApple,
      label: 'Sign in with Apple',
      color: '#000000',
    },
    {
      id: 'google',
      icon: FaGoogle,
      onClick: onGoogle,
      label: 'Sign in with Google',
      color: '#4285F4',
    },
    {
      id: 'facebook',
      icon: FaFacebook,
      onClick: onFacebook,
      label: 'Sign in with Facebook',
      color: '#1877F2',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SocialButtonsContainer>
        {buttons.map((btn) => {
          const IconComponent = btn.icon;
          return (
            <motion.div
              key={btn.id}
              variants={buttonVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <StyledSocialButton
                onClick={btn.onClick}
                title={btn.label}
                aria-label={btn.label}
              >
                <IconComponent style={{ color: btn.color }} />
              </StyledSocialButton>
            </motion.div>
          );
        })}
      </SocialButtonsContainer>
    </motion.div>
  );
};

export default SocialButtons;
