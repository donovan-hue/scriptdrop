import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Context para el tema
 */
export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

/**
 * Hook para manejar temas oscuro/claro
 */
export const useThemeMode = () => {
  const [theme, setTheme] = useState(() => {
    // Intentar obtener del localStorage
    const saved = localStorage.getItem('theme');
    if (saved) return saved;

    // Auto-detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  }, []);

  const setThemeMode = useCallback((newTheme) => {
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
  }, []);

  // Aplicar tema al montar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Escuchar cambios de preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark'
  };
};

/**
 * Provider para proporcionar tema a toda la app
 */
export const ThemeProvider = ({ children }) => {
  const themeMode = useThemeMode();

  return (
    <ThemeContext.Provider value={themeMode}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para colores del tema actual
 */
export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    primary: '#6366f1',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: isDark ? '#1f2937' : '#ffffff',
    surfaceLight: isDark ? '#111827' : '#f9fafb',
    text: isDark ? '#f3f4f6' : '#1f2937',
    textSecondary: isDark ? '#d1d5db' : '#6b7280',
    border: isDark ? '#374151' : '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };
};
