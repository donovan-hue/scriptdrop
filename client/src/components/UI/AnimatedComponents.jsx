import React from 'react';
import { motion } from 'framer-motion';

/**
 * Transiciones de página predefinidas
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

const slideVariants = {
  initial: {
    opacity: 0,
    x: 100
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * AnimatedPage Component
 * Envuelve una página con animaciones de entrada/salida
 */
export const AnimatedPage = ({
  children,
  variant = 'initial', // initial, slide, fade
  className = ''
}) => {
  const variants = {
    initial: pageVariants,
    slide: slideVariants,
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedContainer Component
 * Contenedor con animaciones de aparición en cascada
 */
export const AnimatedContainer = ({
  children,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedItem Component
 * Item dentro de un AnimatedContainer
 */
export const AnimatedItem = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeInScroll Component
 * Anima elemento cuando entra en viewport
 */
export const FadeInScroll = ({
  children,
  direction = 'up', // up, down, left, right
  delay = 0,
  className = ''
}) => {
  const directions = {
    up: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } }
  };

  return (
    <motion.div
      className={className}
      initial={directions[direction].initial}
      whileInView={directions[direction].animate}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerContainer Component
 * Contenedor para animaciones escalonadas
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.05,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay
            }
          }
        },
        item: {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={{ item: { hidden: { opacity: 0 }, visible: { opacity: 1 } } }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * RotateInAnimation Component
 * Animación de rotación
 */
export const RotateInAnimation = ({
  children,
  duration = 0.6,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotate: -10 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      transition={{ duration }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleInAnimation Component
 * Animación de escala
 */
export const ScaleInAnimation = ({
  children,
  duration = 0.4,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

/**
 * HoverScale Component
 * Escala en hover
 */
export const HoverScale = ({
  children,
  scale = 1.05,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * CountUp Component
 * Animación de conteo
 */
export const CountUp = ({
  from = 0,
  to = 100,
  duration = 2,
  className = ''
}) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let currentValue = from;

    const increment = (to - from) / (duration * 60); // 60fps
    let animationFrame;

    const animate = () => {
      currentValue += increment;
      if (currentValue >= to) {
        element.textContent = Math.floor(to);
      } else {
        element.textContent = Math.floor(currentValue);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span ref={ref} className={className}>{from}</span>;
};

/**
 * Parallax Component
 * Efecto parallax en scroll
 */
export const Parallax = ({
  children,
  offset = 50,
  className = ''
}) => {
  const ref = React.useRef(null);
  const [y, setY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementY = rect.top / window.innerHeight;
        setY(elementY * offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
