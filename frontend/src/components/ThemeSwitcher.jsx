// ThemeSwitcher.js
import React from 'react';


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

const ThemeSwitcher = () => {
  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="theme-switcher">
      {themes.map((theme) => (
        <label key={theme.value} className="theme-bubble">
          <input
            type="radio"
            name="theme"
            value={theme.value}
            onChange={() => handleThemeChange(theme.value)}
          />
          <span className="bubble" title={theme.name}></span>
        </label>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
