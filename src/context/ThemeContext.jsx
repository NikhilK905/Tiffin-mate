import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function initialTheme() {
  try {
    const saved = localStorage.getItem('tiffin-theme');
    if (saved) return saved;
  } catch {
    // fall through to the default
  }
  return 'light'; // light-first: the system preference is ignored until the user toggles
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('tiffin-theme', theme);
    } catch {
      // not critical
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
