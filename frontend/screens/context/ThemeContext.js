import React, { createContext, useState, useContext } from 'react';

export const themes = {
  azul: { 
    name: 'Branco e Azul', 
    bg: '#F8F9FA', card: '#FFFFFF', primary: '#2E86AB', text: '#1A1A1A', 
    subtext: '#666666', border: '#2E86AB' 
  },
  roxo: { 
    name: 'Preto e Roxo', 
    bg: '#1A1A1A', card: '#2A2A2A', primary: '#9D8DF1', text: '#FFFFFF', 
    subtext: '#AAAAAA', border: '#9D8DF1' 
  },
  bege: { 
    name: 'Bege e Pêssego', 
    bg: '#FDF6EC', card: '#FFFFFF', primary: '#FFB067', text: '#333333', 
    subtext: '#777777', border: '#5B4A88' // Roxo para contraste
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('azul');
  const theme = themes[themeName];

  const changeTheme = (name) => {
    if (themes[name]) setThemeName(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);