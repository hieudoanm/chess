'use client';

import type { FC, ReactNode } from 'react';
import { DataProvider } from '@/providers/DataProvider';
import { SWProvider } from '@/providers/SWProvider';

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <SWProvider>
    <DataProvider>{children}</DataProvider>
  </SWProvider>
);

Providers.displayName = 'Providers';
