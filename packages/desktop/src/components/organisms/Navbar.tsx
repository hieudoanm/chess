'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC, ReactNode } from 'react';
import { FiHome, FiPlus, FiUser } from 'react-icons/fi';

interface NavbarItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export const NAV_ITEMS: NavbarItem[] = [
  { label: 'Dashboard', href: '/', icon: <FiHome /> },
  { label: 'Create', href: '/create', icon: <FiPlus /> },
  { label: 'Profile', href: '/profile', icon: <FiUser /> },
];

interface NavbarProps {
  items: NavbarItem[];
}

export const Navbar: FC<NavbarProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <nav className="border-base-300 bg-base-100 fixed bottom-0 flex w-full justify-around border-t py-3">
      {items.map((item) => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
