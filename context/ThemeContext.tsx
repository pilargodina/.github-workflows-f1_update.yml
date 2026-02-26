import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: { background: '#FFF', text: '#000', card: '#F8F8F8', border: '#EEE' }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const colors = {
    background: isDarkMode ? '#121212' : '#FFF',
    text: isDarkMode ? '#FFF' : '#000',
    card: isDarkMode ? '#1E1E1E' : '#F8F8F8',
    border: isDarkMode ? '#333' : '#EEE',
    primary: '#E10600',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);