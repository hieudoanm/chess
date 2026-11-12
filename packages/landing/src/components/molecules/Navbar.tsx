'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FC, MouseEventHandler } from 'react';
import { PiGithubLogo } from 'react-icons/pi';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
}

interface NavbarProps {
  name: string;
  logoSrc?: string;
  links: NavLink[];
  groups?: NavGroup[];
  githubUrl: string;
}

const NAV_LINK =
  'text-base-content/60 hover:text-primary px-3 py-2 text-sm font-semibold transition-colors';

const NavItemLink: FC<{
  link: NavLink;
  className?: string;
  onClick?: MouseEventHandler;
}> = ({ link, className, onClick }) =>
  link.href.startsWith('/') ? (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={className} onClick={onClick}>
      {link.label}
    </a>
  );

const Dropdown: FC<{
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}> = ({ group, open, onToggle, onNavigate }) => (
  <div className="relative">
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      onClick={onToggle}
      className={`${NAV_LINK} inline-flex items-center gap-1`}>
      {group.label}
      <span aria-hidden="true" className="text-xs">
        {open ? '▴' : '▾'}
      </span>
    </button>
    {open && (
      <ul className="border-base-content/10 bg-base-100 absolute top-full left-0 z-50 mt-1 min-w-40 rounded-xl border p-1 shadow-lg">
        {group.items.map((item) => (
          <li key={item.href}>
            <NavItemLink
              link={item}
              onClick={onNavigate}
              className="text-base-content/70 hover:bg-base-200 hover:text-primary block rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
            />
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Navbar: FC<NavbarProps> = ({
  name,
  logoSrc,
  links,
  groups = [],
  githubUrl,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const close = () => setOpenMenu(null);

  return (
    <header className="border-base-content/10 bg-base-100/90 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- static SVG/PNG asset
            <img
              src={logoSrc}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
          )}
          <span className="font-serif text-lg font-bold tracking-tight">
            {name}
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {groups.map((group) => (
            <Dropdown
              key={group.label}
              group={group}
              open={openMenu === group.label}
              onToggle={() =>
                setOpenMenu(openMenu === group.label ? null : group.label)
              }
              onNavigate={close}
            />
          ))}
          {links.map((link) => (
            <NavItemLink key={link.href} link={link} className={NAV_LINK} />
          ))}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm ml-2 gap-1.5">
            <PiGithubLogo className="h-4 w-4" />
            GitHub
          </a>
        </nav>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm ml-auto gap-1.5 md:hidden">
          <PiGithubLogo className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
};

Navbar.displayName = 'Navbar';

export default Navbar;
