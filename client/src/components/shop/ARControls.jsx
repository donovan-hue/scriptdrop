import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import useAR from '../../hooks/useAR';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

const ControlSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.7;
    margin-bottom: 8px;
  }
`;

const ControlButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  button {
    flex: 1;
  }
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  .color-option {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;

    &.selected {
      border-color: white;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
    }

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;

    .value {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
  }

  input[type='range'] {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
`;

const VariationSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .variation-option {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid transparent;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;

    &.selected {
      background: rgba(255, 255, 255, 0.25);
      border-color: white;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const PoseIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) => (props.detected ? '#4ade80' : '#f87171')};
    animation: ${(props) => (props.detected ? 'pulse 1s infinite' : 'none')};
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ARControls = ({ onSnapshot, onRecording, isRecording, onShare }) => {
  const { rotateModel, zoomModel, changeColor } = useAR();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedSize, setSelectedSize] = useState('M');
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [poseDetected, setPoseDetected] = useState(false);

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Purple', hex: '#A855F7' },
    { name: 'Pink', hex: '#EC4899' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    changeColor(parseInt(color.hex.slice(1), 16));
  };

  const handleRotate = () => {
    rotateModel(30, 0);
    setRotation((prev) => (prev + 30) % 360);
  };

  const handleZoom = (direction) => {
    zoomModel(direction);
    if (direction === 'in') {
      setScale((prev) => Math.min(3, prev + 0.2));
    } else {
      setScale((prev) => Math.max(0.5, prev - 0.2));
    }
  };

  return (
    <ControlsContainer>
      {/* Model Rotation */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-title">Model Controls</div>
        <ButtonGroup>
          <ControlButton onClick={handleRotate} whileHover={{ scale: 1.05 }}>
            <FiRotateCw /> Rotate
          </ControlButton>
        </ButtonGroup>

        <SliderContainer>
          <div className="slider-label">
            <span>Rotation</span>
            <span className="value">{rotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => {
              const newRotation = parseInt(e.target.value);
              const delta = newRotation - rotation;
              rotateModel(delta, 0);
              setRotation(newRotation);
            }}
          />
        </SliderContainer>
      </ControlSection>

      {/* Zoom Controls */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="section-title">Zoom</div>
        <ButtonGroup>
          <ControlButton onClick={() => handleZoom('in')} whileHover={{ scale: 1.05 }}>
            <FiZoomIn /> In
          </ControlButton>
          <ControlButton onClick={() => handleZoom('out')} whileHover={{ scale: 1.05 }}>
            <FiZoomOut /> Out
          </ControlButton>
        </ButtonGroup>

        <SliderContainer>
          <div className="slider-label">
            <span>Scale</span>
            <span className="value">{scale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => {
              const newScale = parseFloat(e.target.value);
              zoomModel(newScale > scale ? 'in' : 'out');
              setScale(newScale);
            }}
          />
        </SliderContainer>
      </ControlSection>

      {/* Color Selection */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-title">Colors</div>
        <ColorPicker>
          {colors.map((color) => (
            <motion.div
              key={color.hex}
              className={`color-option ${
                selectedColor === color.hex ? 'selected' : ''
              }`}
              style={{ background: color.hex }}
              onClick={() => handleColorChange(color)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={color.name}
            />
          ))}
        </ColorPicker>
      </ControlSection>

      {/* Size Selection */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="section-title">Size</div>
        <VariationSelector>
          {sizes.map((size) => (
            <motion.div
              key={size}
              className={`variation-option ${
                selectedSize === size ? 'selected' : ''
              }`}
              onClick={() => setSelectedSize(size)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Size {size}
            </motion.div>
          ))}
        </VariationSelector>
      </ControlSection>

      {/* Pose Detection */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PoseIndicator detected={poseDetected}>
          <div className="indicator" />
          <span>Pose Detection</span>
        </PoseIndicator>
      </ControlSection>

      {/* Action Buttons */}
      <ControlSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="section-title">Actions</div>
        <ControlButton onClick={onSnapshot} whileHover={{ scale: 1.05 }}>
          📸 Snapshot
        </ControlButton>
        <ControlButton
          onClick={onRecording}
          className={isRecording ? 'recording' : ''}
          whileHover={{ scale: 1.05 }}
          style={{
            background: isRecording
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(255, 255, 255, 0.15)',
            borderColor: isRecording
              ? 'rgba(239, 68, 68, 0.5)'
              : 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {isRecording ? '⏹️ Stop' : '🎥 Record'}
        </ControlButton>
        <ControlButton onClick={onShare} whileHover={{ scale: 1.05 }}>
          📤 Share
        </ControlButton>
      </ControlSection>
    </ControlsContainer>
  );
};

export default ARControls;
