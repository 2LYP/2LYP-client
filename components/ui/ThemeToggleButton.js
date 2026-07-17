"use client";
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggleButton({ className = "", position = "fixed" }) {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <div 
      className={`${position} top-6 right-8 z-50 flex items-center ${className}`}
    >
      <button
        onClick={toggleTheme}
        className="typewriter rounded-full w-12 h-12 p-0 relative bg-gray-200 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 transition-all duration-300 hover:scale-110"
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {/* Sun icon for light mode */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isDarkMode ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="w-6 h-6 bg-yellow-400 rounded-full relative">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Moon icon for dark mode */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isDarkMode ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-6 h-6 bg-blue-400 rounded-full relative">
            <div className="absolute top-1 right-1 w-4 h-4 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </button>
    </div>
  );
}