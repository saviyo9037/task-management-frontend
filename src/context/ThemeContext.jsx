import { createContext, useContext, useEffect, useState } from 'react';

const themes = [
  {
    id: 'light',
    name: 'Light',
    preview: ['#ffffff', '#f3f4f6', '#7c3aed'],
  },
  {
    id: 'dark',
    name: 'Dark',
    preview: ['#111827', '#1f2937', '#8b5cf6'],
  }
];

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  themes,
});

export const useTheme = () => useContext(ThemeContext);

const applyTheme = (themeId) => {
  const root = document.documentElement;
  root.removeAttribute('data-theme');

  let resolved = themeId;
  if (themeId === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', resolved);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('taskflow-theme') || 'light';
  });

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem('taskflow-theme', id);
    applyTheme(id);
  };

  useEffect(() => {
    applyTheme(theme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
