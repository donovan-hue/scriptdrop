import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GlassButton from '../components/UI/GlassButton';
import SocialButtons from '../components/UI/SocialButtons';
import LogoHexagon from '../components/UI/LogoHexagon';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #f5f0ff 50%,
    #f0f8ff 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
`;

const BackgroundBlobs = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  .blob {
    position: absolute;
    opacity: 0.1;
    filter: blur(40px);
  }
  
  .blob-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #ff6ec7, #b344ff);
    top: -150px;
    left: -150px;
    border-radius: 50%;
    opacity: 0.12;
  }

  .blob-2 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #00d4ff, #5b8fff);
    bottom: -200px;
    right: -150px;
    border-radius: 50%;
    opacity: 0.1;
  }

  .blob-3 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #b344ff, #00d4ff);
    top: 40%;
    right: 5%;
    border-radius: 50%;
    opacity: 0.08;
  }
`;

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  max-width: 600px;
  width: 100%;
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
`;

const TitleSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 50px;
`;

const WelcomeText = styled(motion.h1)`
  font-family: 'Poppins', sans-serif;
  font-size: clamp(36px, 8vw, 72px);
  font-weight: 800;
  background: linear-gradient(135deg, #b344ff 0%, #5b8fff 50%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px 0;
  letter-spacing: -1px;
  filter: drop-shadow(0 0 20px rgba(179, 68, 255, 0.25));
`;

const SubtitleText = styled(motion.p)`
  font-size: 18px;
  color: #595d6a;
  font-weight: 400;
  line-height: 1.6;
  margin: 0;
`;

const ButtonsSection = styled(motion.div)`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;
`;

const SocialSection = styled(motion.div)`
  margin-bottom: 40px;
`;

const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 40px 0;
  opacity: 0.6;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #b0b8c8, transparent);
`;

const DividerText = styled.span`
  font-size: 14px;
  color: #595d6a;
  font-weight: 500;
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 50px;
`;

const FeatureCard = styled(motion.div)`
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(179, 68, 255, 0.25);
    box-shadow: 0 0 20px rgba(179, 68, 255, 0.2), 0 0 15px rgba(0, 212, 255, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const FeatureTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  background: linear-gradient(135deg, #b344ff, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Welcome = () => {
  const navigate = useNavigate();
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

  const handleAppleSignIn = async () => {
    setIsLoadingApple(true);
    // Simular delay
    setTimeout(() => {
      setIsLoadingApple(false);
      // Aquí iría la lógica real de Apple Sign-In
    }, 2000);
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    // Simular delay
    setTimeout(() => {
      setIsLoadingGoogle(false);
      // Aquí iría la lógica real de Google Sign-In
    }, 2000);
  };

  const handleFacebookSignIn = async () => {
    setIsLoadingFacebook(true);
    // Simular delay
    setTimeout(() => {
      setIsLoadingFacebook(false);
      // Aquí iría la lógica real de Facebook Sign-In
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const features = [
    { icon: '👥', name: 'Social' },
    { icon: '🛍️', name: 'Shop' },
    { icon: '🍽️', name: 'Food' },
    { icon: '🔍', name: 'Discovery' },
    { icon: '💬', name: 'Chat' },
    { icon: '⭐', name: 'Trending' },
  ];

  return (
    <Container>
      <BackgroundBlobs>
        <motion.div
          className="blob blob-1"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="blob blob-2"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="blob blob-3"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </BackgroundBlobs>

      <ContentWrapper
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <LogoContainer variants={itemVariants}>
          <LogoHexagon size={140} animate={true} />
        </LogoContainer>

        {/* Title Section */}
        <TitleSection variants={itemVariants}>
          <WelcomeText
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Welcome
          </WelcomeText>
          <SubtitleText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Experience the future of social, shopping, and food delivery in one
            revolutionary platform
          </SubtitleText>
        </TitleSection>

        {/* Main Action Buttons */}
        <ButtonsSection variants={itemVariants}>
          <GlassButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/auth/register')}
          >
            Get Started
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate('/auth/login')}
          >
            Sign In
          </GlassButton>
        </ButtonsSection>

        {/* Divider */}
        <DividerContainer>
          <DividerLine />
          <DividerText>or continue with</DividerText>
          <DividerLine />
        </DividerContainer>

        {/* Social Sign-In Buttons */}
        <SocialSection variants={itemVariants}>
          <SocialButtons
            onApple={handleAppleSignIn}
            onGoogle={handleGoogleSignIn}
            onFacebook={handleFacebookSignIn}
          />
        </SocialSection>

        {/* Features Grid */}
        <FeaturesGrid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.name}</FeatureTitle>
            </FeatureCard>
          ))}
        </FeaturesGrid>

        {/* Footer Text */}
        <motion.div
          variants={itemVariants}
          style={{
            textAlign: 'center',
            marginTop: 40,
            fontSize: 14,
            color: '#595d6a',
          }}
        >
          <p>
            By signing up, you agree to our{' '}
            <span style={{ color: '#ff6ec7', fontWeight: 600 }}>
              Terms of Service
            </span>{' '}
            and{' '}
            <span style={{ color: '#00d4ff', fontWeight: 600 }}>
              Privacy Policy
            </span>
          </p>
        </motion.div>
      </ContentWrapper>
    </Container>
  );
};

export default Welcome;
