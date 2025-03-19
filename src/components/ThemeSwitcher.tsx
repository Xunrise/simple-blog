'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by rendering only on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-2 border border-gray-200 dark:border-zinc-800 transition-all">
      <div className="flex items-center space-x-1">
        {/* Light theme button */}
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'light' 
              ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          title="Light mode"
          aria-label="Use light theme"
        >
          <SunIcon className="h-5 w-5" />
        </button>
        
        {/* Dark theme button */}
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          title="Dark mode"
          aria-label="Use dark theme"
        >
          <MoonIcon className="h-5 w-5" />
        </button>
        
        {/* System theme button */}
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'system' 
              ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          title="System preference"
          aria-label="Use system theme"
        >
          <ComputerIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Icons
function SunIcon({ className = "h-6 w-6" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function MoonIcon({ className = "h-6 w-6" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

function ComputerIcon({ className = "h-6 w-6" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
} 