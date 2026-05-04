import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCamera, FiShare2, FiDownload, FiX } from 'react-icons/fi';
import useAR from '../hooks/useAR';
import ARCamera from './ARCamera';
import ARControls from './ARControls';

const ARTryOnContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ARHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  backdrop-filter: blur(10px);

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const ARContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CameraSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ControlsSection = styled.div`
  width: 300px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 20px;
  overflow-y: auto;
  color: white;
  border-left: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: center;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    &.danger {
      background: rgba(255, 59, 48, 0.3);
      border: 1px solid rgba(255, 59, 48, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled(motion.div)`
  padding: 12px 16px;
  background: rgba(255, 59, 48, 0.2);
  border: 1px solid rgba(255, 59, 48, 0.5);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 12px;
`;

const ShareModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    text-align: center;

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #333;
    }

    .share-link {
      display: flex;
      gap: 8px;
      margin: 20px 0;

      input {
        flex: 1;
        padding: 10px 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }

      button {
        padding: 10px 16px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;

        &:hover {
          background: #764ba2;
        }
      }
    }

    .social-share {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 20px;

      a {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: #333;
        transition: all 0.3s ease;

        &:hover {
          background: #667eea;
          color: white;
        }
      }
    }
  }
`;

const ARTryOn = ({ productId, productName, onClose }) => {
  const {
    containerRef,
    isInitialized,
    isLoading,
    error,
    isRecording,
    loadModel,
    createSession,
    startRecording,
    stopRecording,
    captureScreenshot,
    generateShareLink,
    endSession,
  } = useAR();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef(null);

  /**
   * Initialize AR on component mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 600;

        // Initialize AR scene
        if (containerRef.current) {
          containerRef.current.style.position = 'relative';
        }

        // Create AR session
        const sessionId = await createSession(productId, {
          isMobile: window.innerWidth < 768,
        });

        // Initialize AR (scene + camera)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Load 3D model
        await loadModel(productId);
      } catch (err) {
        console.error('Failed to initialize AR:', err);
      }
    };

    init();

    return () => {
      endSession();
    };
  }, [productId, createSession, loadModel, endSession]);

  /**
   * Handle recording timer
   */
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  /**
   * Handle screenshot
   */
  const handleScreenshot = async () => {
    try {
      const screenshotUrl = await captureScreenshot();
      // Trigger download
      const link = document.createElement('a');
      link.href = screenshotUrl;
      link.download = `ar-try-on-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  /**
   * Handle recording
   */
  const handleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  /**
   * Handle share
   */
  const handleShare = async () => {
    try {
      const url = await generateShareLink(true);
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  };

  /**
   * Copy share link to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  /**
   * Format recording time
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ARTryOnContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ARHeader>
        <h2>Virtual Try-On: {productName}</h2>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </ARHeader>

      <ARContent>
        <CameraSection ref={containerRef}>
          {isLoading && (
            <LoadingOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="spinner" />
            </LoadingOverlay>
          )}

          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </ErrorMessage>
          )}

          {isRecording && (
            <motion.div
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255, 59, 48, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5,
                fontSize: '14px',
                fontWeight: 600,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite',
                }}
              />
              Recording: {formatTime(recordingDuration)}
            </motion.div>
          )}

          <ARCamera />
        </CameraSection>

        <ControlsSection>
          <ARControls
            onSnapshot={handleScreenshot}
            onRecording={handleRecording}
            isRecording={isRecording}
            onShare={handleShare}
          />
        </ControlsSection>
      </ARContent>

      <ActionBar>
        <button onClick={handleScreenshot} title="Take Screenshot">
          <FiCamera /> Snapshot
        </button>
        <button
          onClick={handleRecording}
          className={isRecording ? 'danger' : ''}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button onClick={handleShare} className="primary" title="Share">
          <FiShare2 /> Share
        </button>
        <button onClick={onClose} title="Close">
          <FiX /> Close
        </button>
      </ActionBar>

      {showShareModal && (
        <ShareModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h3>Share Your Try-On</h3>
            <p>Share this link with your friends and family!</p>

            <div className="share-link">
              <input type="text" value={shareUrl} readOnly />
              <button onClick={copyToClipboard}>Copy</button>
            </div>

            <div className="social-share">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
              >
                f
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=Check%20out%20my%20AR%20try-on!`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Twitter"
              >
                𝕏
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  'Check out my AR try-on: ' + shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
              >
                W
              </a>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </motion.div>
        </ShareModal>
      )}
    </ARTryOnContainer>
  );
};

export default ARTryOn;
