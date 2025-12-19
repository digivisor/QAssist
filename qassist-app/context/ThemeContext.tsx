import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    input: string;
    inputBorder: string;
    placeholder: string;
  };
};

const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  card: '#ffffff',
  input: '#ffffff',
  inputBorder: '#e2e8f0',
  placeholder: '#94a3b8',
};

const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  card: '#1e293b',
  input: '#1e293b',
  inputBorder: '#334155',
  placeholder: '#64748b',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: async () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'true');
      }
    } catch (e) {
      console.error('Tema yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('darkMode', newTheme.toString());
    } catch (e) {
      console.error('Tema kaydedilemedi:', e);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  const value = {
    isDark,
    toggleTheme,
    colors,
  };

  // Loading sırasında light theme göster
  if (loading) {
    return (
      <ThemeContext.Provider value={{ ...value, colors: lightColors }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

