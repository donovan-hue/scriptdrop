import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom Hook para manejar gestos táctiles
 * Soporta: swipe, pinch, long-press, double-tap, drag
 */
export const useGestures = (callbacks = {}) => {
  const elementRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEventsRef = useRef({
    touches: [],
    lastTouchDistance: 0
  });

  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {},
    onPinchIn = () => {},
    onPinchOut = () => {},
    onLongPress = () => {},
    onDoubleTap = () => {},
    onDrag = () => {}
  } = callbacks;

  // Detectar distancia entre dos toques (para pinch)
  const getTouchDistance = useCallback((touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Manejar touch start
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    touchEventsRef.current.touches = Array.from(e.touches);
    touchEventsRef.current.lastTouchDistance = getTouchDistance(e.touches);

    // Long press timer
    const longPressTimer = setTimeout(() => {
      onLongPress({ x: touch.clientX, y: touch.clientY });
    }, 500);

    touchEventsRef.current.longPressTimer = longPressTimer;
  }, [getTouchDistance, onLongPress]);

  // Manejar touch move
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 0) return;

    // Cancelar long press si se está moviendo
    if (touchEventsRef.current.longPressTimer) {
      clearTimeout(touchEventsRef.current.longPressTimer);
    }

    // Detectar pinch
    if (e.touches.length === 2) {
      const newDistance = getTouchDistance(e.touches);
      const lastDistance = touchEventsRef.current.lastTouchDistance;
      const delta = newDistance - lastDistance;

      if (Math.abs(delta) > 10) {
        if (delta > 0) {
          onPinchOut(); // Zoom out
        } else {
          onPinchIn(); // Zoom in
        }
      }

      touchEventsRef.current.lastTouchDistance = newDistance;
    }

    // Detectar drag
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    onDrag({ x: deltaX, y: deltaY, touch });
  }, [getTouchDistance, onPinchIn, onPinchOut, onDrag]);

  // Manejar touch end
  const handleTouchEnd = useCallback((e) => {
    clearTimeout(touchEventsRef.current.longPressTimer);

    const touch = touchStartRef.current;
    const endX = e.changedTouches[0]?.clientX || touch.x;
    const endY = e.changedTouches[0]?.clientY || touch.y;
    const deltaX = endX - touch.x;
    const deltaY = endY - touch.y;
    const deltaTime = Date.now() - touch.time;

    // Mínimo threshold para detectar swipe (30px)
    const minDistance = 30;
    // Máximo tiempo para detectar swipe (300ms)
    const maxTime = 300;
    // Threshold de ángulo (75 grados)
    const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI);

    if (deltaTime < maxTime && Math.abs(deltaX) > minDistance && angle < 20) {
      // Swipe horizontal
      if (deltaX > 0) {
        onSwipeRight({ distance: deltaX, time: deltaTime });
      } else {
        onSwipeLeft({ distance: Math.abs(deltaX), time: deltaTime });
      }
    } else if (deltaTime < maxTime && Math.abs(deltaY) > minDistance && angle > 70) {
      // Swipe vertical
      if (deltaY > 0) {
        onSwipeDown({ distance: deltaY, time: deltaTime });
      } else {
        onSwipeUp({ distance: Math.abs(deltaY), time: deltaTime });
      }
    }

    // Double tap detection
    if (Date.now() - touch.time < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (elementRef.current?.lastTapTime && Date.now() - elementRef.current.lastTapTime < 300) {
        onDoubleTap({ x: endX, y: endY });
      }
      elementRef.current = elementRef.current || {};
      elementRef.current.lastTapTime = Date.now();
    }

    touchEventsRef.current.touches = [];
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap]);

  // Attach listeners
  useEffect(() => {
    const element = elementRef.current || window;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};

/**
 * Hook para detectar shake del dispositivo
 * Útil para activar acciones especiales (búsqueda, filtros, etc.)
 */
export const useShake = (callback, threshold = 15) => {
  useEffect(() => {
    let lastX = 0,
      lastY = 0,
      lastZ = 0;
    let lastTime = 0;

    const handleDeviceMotion = (event) => {
      const x = event.acceleration.x;
      const y = event.acceleration.y;
      const z = event.acceleration.z;
      const currentTime = Date.now();

      if (currentTime - lastTime > 100) {
        const diffX = Math.abs(x - lastX);
        const diffY = Math.abs(y - lastY);
        const diffZ = Math.abs(z - lastZ);

        if (diffX + diffY + diffZ > threshold) {
          callback();
        }

        lastX = x;
        lastY = y;
        lastZ = z;
        lastTime = currentTime;
      }
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+
      DeviceMotionEvent.requestPermission().then((permissionState) => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
      });
    } else {
      // Android
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [callback, threshold]);
};

/**
 * Hook para pull-to-refresh
 */
export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const ref = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const refreshingRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (ref.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (ref.current?.scrollTop !== 0) return;

    currentYRef.current = e.touches[0].clientY - startYRef.current;

    if (currentYRef.current > threshold && !refreshingRef.current) {
      refreshingRef.current = true;
      onRefresh();
    }
  }, [onRefresh, threshold]);

  const handleTouchEnd = useCallback(() => {
    currentYRef.current = 0;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { ref, progress: Math.min(currentYRef.current / threshold, 1) };
};

/**
 * Hook para detectar orientación del dispositivo
 */
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};
