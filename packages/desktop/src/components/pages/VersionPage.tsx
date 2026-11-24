'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { VersionTemplate } from '@/components/templates/VersionTemplate';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';

export const VersionPage: FC = () => {
  const [version, setVersion] = useState('YYYY.MM.DD.hh.mm.ss');

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setVersion(
      [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate()),
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds()),
      ].join('.')
    );
  }, []);

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <VersionTemplate version={version} />
      <Navbar items={NAV_ITEMS} />
    </div>
  );
};
