import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="btn btn-outline-secondary border-0" onClick={toggleTheme}>
      {theme === 'light' ? (
        <i className="bi bi-moon-stars-fill"></i> // Moon icon
      ) : (
        <i className="bi bi-sun-fill"></i> // Sun icon
      )}
    </button>
  );
}