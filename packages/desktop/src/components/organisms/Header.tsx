'use client';

import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/version', label: 'Version' },
] as const;

const APP_NAME: string = 'Tourney';
const THEME_KEY: string = 'tourney-theme';
const THEME_DARK: string = 'tourney-dark';
const THEME_LIGHT: string = 'tourney-light';

const getInitialTheme = (): string => {
  if (typeof window === 'undefined') return THEME_LIGHT;
  return localStorage.getItem(THEME_KEY) || THEME_LIGHT;
};

export const Header: FC = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT));

  return (
    <header className="border-base-300 bg-base-100 sticky top-0 z-10 w-full border-b px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-base-content text-sm font-bold">
            {APP_NAME}
          </Link>
        </div>

        <nav className="flex w-auto items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base-content/60 hover:text-primary px-3 py-1 text-xs transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="dropdown dropdown-end md:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label="Menu"
              aria-haspopup="menu"
              tabIndex={0}>
              <FiMenu className="text-lg" />
            </button>
            <ul
              tabIndex={0}
              role="menu"
              className="dropdown-content bg-base-100 border-base-300 menu rounded-box border px-2 py-2 shadow">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-xs">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-testid="theme-toggle">
            {theme === THEME_DARK ? (
              <FiSun className="text-lg" />
            ) : (
              <FiMoon className="text-lg" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
