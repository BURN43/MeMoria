import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const themes = [
  { name: 'Default', value: 'default' },
  { name: 'hochzeit', value: 'hochzeit' },
  { name: 'verlobung', value: 'verlobung' },
  { name: 'henna', value: 'henna' },
  { name: 'kunst', value: 'kunst' },
  { name: 'geburtstag', value: 'geburtstag' },
  { name: 'babyshower', value: 'babyshower' },
  { name: 'jahrestag', value: 'jahrestag' },
  { name: 'taufe', value: 'taufe' },
];

const ThemeSwitcher = ({ isAuthenticated, currentTheme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = useState(currentTheme || 'default');

  useEffect(() => {
    setLocalTheme(currentTheme || 'default');
  }, [currentTheme]);

  const handleThemeChange = (theme) => {
    setLocalTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    onThemeChange(theme);
  };

  return (
    <div className="theme-switcher">
      {themes.map((theme) => (
        <label key={theme.value} className="theme-bubble">
          <input
            type="radio"
            name="theme"
            value={theme.value}
            checked={localTheme === theme.value}
            onChange={() => handleThemeChange(theme.value)}
          />
          <span className="bubble" title={theme.name}></span>
        </label>
      ))}
    </div>
  );
};

export default ThemeSwitcher;