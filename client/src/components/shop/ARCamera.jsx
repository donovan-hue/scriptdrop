import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import arService from '../../services/arService';

const CameraContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const VideoPreview = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  z-index: 0;
`;

const AROverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const CameraPermissionPrompt = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  z-index: 100;
  max-width: 300px;
  backdrop-filter: blur(10px);

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 14px;
    opacity: 0.9;
  }

  .button-group {
    display: flex;
    gap: 12px;

    button {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;

      &.allow {
        background: #667eea;
        color: white;

        &:hover {
          background: #764ba2;
        }
      }

      &.deny {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
`;

const DebugInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #00ff00;
  padding: 10px;
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  z-index: 5;
  max-width: 200px;
  word-break: break-word;

  div {
    margin: 4px 0;
  }
`;

const ARCamera = ({ showDebugInfo = false }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraPermissionAsked, setCameraPermissionAsked] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] =
    useState(false);
  const [debugInfo, setDebugInfo] = useState({
    fps: 0,
    poseDetected: false,
    modelLoaded: false,
  });
  const fpsRef = useRef({ count: 0, lastTime: Date.now() });

  /**
   * Initialize AR camera
   */
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setCameraPermissionAsked(true);

        // Initialize Three.js scene with canvas
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 600;

        // Create canvas for Three.js
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        containerRef.current?.appendChild(canvas);
        canvasRef.current = canvas;

        // Initialize AR service
        arService.initScene(containerRef.current, width, height);

        // Request camera permission
        const stream = await arService.initVideoStream();
        videoRef.current = arService.videoElement;

        // Initialize pose detection
        await arService.initPoseDetection();

        // Start AR
        await arService.start();

        setCameraPermissionGranted(true);

        // Start rendering loop
        const animate = () => {
          // Update FPS
          fpsRef.current.count++;
          const now = Date.now();
          if (now - fpsRef.current.lastTime >= 1000) {
            setDebugInfo((prev) => ({
              ...prev,
              fps: fpsRef.current.count,
            }));
            fpsRef.current.count = 0;
            fpsRef.current.lastTime = now;
          }

          setDebugInfo((prev) => ({
            ...prev,
            modelLoaded: arService.model ? true : false,
            poseDetected:
              arService.poseData.length > 0
                ? arService.poseData[arService.poseData.length - 1].confidence >
                  0.5
                : false,
          }));

          requestAnimationFrame(animate);
        };
        animate();
      } catch (error) {
        console.error('Error initializing camera:', error);
        setCameraPermissionGranted(false);
      }
    };

    if (containerRef.current) {
      initializeCamera();
    }

    // Cleanup
    return () => {
      if (arService.isRunning) {
        arService.stop();
      }
    };
  }, []);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        arService.handleResize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle mouse drag for model rotation
   */
  useEffect(() => {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      arService.rotateModel(deltaX, deltaY);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        canvasRef.current?.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, []);

  /**
   * Handle touch for mobile
   */
  useEffect(() => {
    let touchStartDistance = 0;
    let previousTouchPosition = { x: 0, y: 0 };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        previousTouchPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousTouchPosition.x;
        const deltaY = e.touches[0].clientY - previousTouchPosition.y;
        arService.rotateModel(deltaX, deltaY);
        previousTouchPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const touchDistance = Math.sqrt(dx * dx + dy * dy);
        const delta = touchDistance - touchStartDistance;

        if (delta > 10) {
          arService.zoomModel('in');
          touchStartDistance = touchDistance;
        } else if (delta < -10) {
          arService.zoomModel('out');
          touchStartDistance = touchDistance;
        }
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('touchstart', onTouchStart, false);
      containerRef.current.addEventListener('touchmove', onTouchMove, false);

      return () => {
        containerRef.current?.removeEventListener('touchstart', onTouchStart);
        containerRef.current?.removeEventListener('touchmove', onTouchMove);
      };
    }
  }, []);

  /**
   * Handle mouse wheel zoom
   */
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        arService.zoomModel('in');
      } else {
        arService.zoomModel('out');
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', onWheel, {
        passive: false,
      });

      return () => {
        containerRef.current?.removeEventListener('wheel', onWheel);
      };
    }
  }, []);

  return (
    <CameraContainer ref={containerRef}>
      {videoRef.current && (
        <VideoPreview ref={videoRef} playsInline autoPlay muted />
      )}

      <AROverlay />

      {!cameraPermissionGranted && cameraPermissionAsked && (
        <CameraPermissionPrompt
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3>Camera Permission Required</h3>
          <p>
            This app needs camera access to show your AR try-on experience.
          </p>
          <div className="button-group">
            <button
              className="allow"
              onClick={() => setCameraPermissionGranted(true)}
            >
              Allow
            </button>
            <button className="deny" onClick={() => {}}>
              Deny
            </button>
          </div>
        </CameraPermissionPrompt>
      )}

      {showDebugInfo && (
        <DebugInfo>
          <div>FPS: {debugInfo.fps}</div>
          <div>Model: {debugInfo.modelLoaded ? '✓' : '✗'}</div>
          <div>Pose: {debugInfo.poseDetected ? '✓' : '✗'}</div>
          <div>
            Poses: {arService.poseData.length} / {arService.poseData.length > 0 ? (arService.poseData[arService.poseData.length - 1].confidence * 100).toFixed(0) : 0}%
          </div>
        </DebugInfo>
      )}
    </CameraContainer>
  );
};

export default ARCamera;
