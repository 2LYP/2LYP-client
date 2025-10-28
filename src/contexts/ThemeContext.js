"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log('Initial theme detection:', {
      savedTheme,
      systemPrefersDark,
      systemTheme: systemPrefersDark ? 'dark' : 'light'
    });
    
    if (savedTheme) {
      setTheme(savedTheme);
      setIsManualOverride(true);
      console.log('Using saved theme:', savedTheme);
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
      setIsManualOverride(false);
      console.log('Using system theme:', systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  // Listen for system theme changes (only if not manually overridden)
  useEffect(() => {
    if (isManualOverride) return; // Don't listen if user has manually set theme
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      console.log('System theme changed:', e.matches ? 'dark' : 'light');
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Add listener for system theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [isManualOverride]);

  // Update body classes and localStorage when theme changes
  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
    
    // Save to localStorage if it's a manual override
    if (isManualOverride) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, isManualOverride]);

  // Listen for custom toggle theme event (for manual override)
  useEffect(() => {
    const handleToggleTheme = () => {
      setIsManualOverride(true); // Mark as manual override
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    window.addEventListener('toggleTheme', handleToggleTheme);
    return () => window.removeEventListener('toggleTheme', handleToggleTheme);
  }, []);

  const toggleTheme = () => {
    setIsManualOverride(true); // Mark as manual override
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetToSystemTheme = () => {
    setIsManualOverride(false);
    localStorage.removeItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemPrefersDark ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isDarkMode, 
      isManualOverride,
      resetToSystemTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
