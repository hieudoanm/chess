'use client';

import type { FC } from 'react';
import { AboutTemplate } from '@/components/templates/AboutTemplate';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';

export const AboutPage: FC = () => (
  <div className="flex min-h-dvh flex-col pb-20">
    <AboutTemplate
      name="Tourney"
      description="Tournament management app for creating and tracking competitions"
      version="v0.0.1"
      items={[
        { label: 'Language', value: 'TypeScript 6.+' },
        { label: 'Framework', value: 'Next.js 16.+' },
        { label: 'Styling', value: 'Tailwind CSS 4.+' },
        { label: 'Components', value: 'DaisyUI 5.+' },
        { label: 'Desktop', value: 'Tauri 2.+' },
      ]}
    />
    <Navbar items={NAV_ITEMS} />
  </div>
);
