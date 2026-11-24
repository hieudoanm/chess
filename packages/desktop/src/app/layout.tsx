import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { FC } from 'react';
import { Providers } from './providers';
import { Header } from '@/components/organisms/Header';

export const metadata: Metadata = {
  title: 'Tourney - Tournaments Manager',
  description: 'Create and manage tournaments across multiple formats',
  metadataBase: new URL('https://hieudoanm.github.io/chess/'),
  openGraph: {
    type: 'website',
    siteName: 'Tourney',
    url: 'https://hieudoanm.github.io/chess/',
    title: 'Run a tournament',
    description:
      'Create and manage tournaments across multiple formats, from participants to standings and brackets.',
    images: [
      {
        url: '/og/og.png',
        width: 1200,
        height: 630,
        alt: 'Tourney — Run a tournament',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Run a tournament',
    description:
      'Create and manage tournaments across multiple formats, from participants to standings and brackets.',
    images: ['/og/og.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tourney',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en" data-theme="tourney-light">
    <body className="bg-base-100 text-base-content h-screen overflow-y-auto font-mono">
      <Header />
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
