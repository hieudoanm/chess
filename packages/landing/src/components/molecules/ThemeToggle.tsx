'use client';

import type { FC } from 'react';
import { PiMoon, PiSun } from 'react-icons/pi';

export const THEME_STORAGE_KEY = 'chess-theme';
export const LIGHT_THEME = 'chess';
export const DARK_THEME = 'chess-dark';

const toggleTheme = () => {
  const root = document.documentElement;
  const next = root.dataset.theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // storage unavailable (private mode) — theme still applies for session
  }
};

const ThemeToggle: FC<{ className?: string }> = ({ className }) => (
  <button
    type="button"
    onClick={toggleTheme}
    aria-label="Toggle dark mode"
    title="Toggle dark mode"
    className={className ?? 'btn btn-ghost btn-sm btn-square'}>
    <PiMoon className="theme-icon-moon h-4 w-4" />
    <PiSun className="theme-icon-sun h-4 w-4" />
  </button>
);

export default ThemeToggle;
