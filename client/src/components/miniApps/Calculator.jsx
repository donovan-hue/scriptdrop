import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './miniapps.css';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleOperation = (op) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculateResult(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setWaitingForNewValue(true);
  };

  const calculateResult = (prev, current, op) => {
    switch (op) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '×': return prev * current;
      case '÷': return prev / current;
      case '%': return (prev * current) / 100;
      default: return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const result = calculateResult(previousValue, parseFloat(display), operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setWaitingForNewValue(false);
    }
  };

  const buttons = [
    { label: 'C', onClick: handleClear, className: 'operator-btn clear-btn', color: '#ff4444' },
    { label: '+/-', onClick: handleToggleSign, className: 'operator-btn' },
    { label: '%', onClick: () => handleOperation('%'), className: 'operator-btn' },
    { label: '÷', onClick: () => handleOperation('÷'), className: 'operator-btn' },

    { label: '7', onClick: () => handleNumber(7), className: 'number-btn' },
    { label: '8', onClick: () => handleNumber(8), className: 'number-btn' },
    { label: '9', onClick: () => handleNumber(9), className: 'number-btn' },
    { label: '×', onClick: () => handleOperation('×'), className: 'operator-btn' },

    { label: '4', onClick: () => handleNumber(4), className: 'number-btn' },
    { label: '5', onClick: () => handleNumber(5), className: 'number-btn' },
    { label: '6', onClick: () => handleNumber(6), className: 'number-btn' },
    { label: '-', onClick: () => handleOperation('-'), className: 'operator-btn' },

    { label: '1', onClick: () => handleNumber(1), className: 'number-btn' },
    { label: '2', onClick: () => handleNumber(2), className: 'number-btn' },
    { label: '3', onClick: () => handleNumber(3), className: 'number-btn' },
    { label: '+', onClick: () => handleOperation('+'), className: 'operator-btn' },

    { label: '0', onClick: () => handleNumber(0), className: 'number-btn zero', span: 2 },
    { label: '.', onClick: handleDecimal, className: 'number-btn' },
    { label: '=', onClick: handleEquals, className: 'operator-btn equals-btn' }
  ];

  return (
    <motion.div
      className="calculator-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="calculator-display">
        <div className="display-text">{display}</div>
      </div>

      <div className="calculator-buttons">
        {buttons.map((btn, idx) => (
          <motion.button
            key={idx}
            onClick={btn.onClick}
            className={`calculator-btn ${btn.className}`}
            style={{
              gridColumn: btn.span ? `span ${btn.span}` : undefined,
              backgroundColor: btn.color
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Calculator;
