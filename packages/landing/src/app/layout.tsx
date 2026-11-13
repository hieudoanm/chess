import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { FC, ReactNode } from 'react';
import Footer from '@/components/molecules/Footer';
import Navbar from '@/components/molecules/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const GITHUB = 'https://github.com/hieudoanm/chess';
// next/image with unoptimized does not apply basePath — mirror next.config.ts.
const LOGO =
  process.env.NODE_ENV === 'production' ? '/chess/logo.svg' : '/logo.svg';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Install', href: '#install' },
  { label: 'Docs', href: '/docs/' },
];

export const metadata: Metadata = {
  metadataBase: new URL('https://hieudoanm.github.io/chess/'),
  title: {
    default: 'chess — a chess engine in one Rust binary',
    template: '%s — chess',
  },
  description:
    'chess is a UCI-compatible engine with alpha-beta search, NNUE evaluation, and perft-tested move generation — plus an MCP server so AI assistants can play and analyze games.',
  openGraph: {
    siteName: 'chess',
    type: 'website',
    title: 'chess — a chess engine in one Rust binary',
    description:
      'chess is a UCI-compatible engine with alpha-beta search, NNUE evaluation, and perft-tested move generation — plus an MCP server so AI assistants can play and analyze games.',
    url: 'https://hieudoanm.github.io/chess/',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
  <html
    lang="en"
    data-theme="chess"
    className={`scroll-smooth antialiased motion-reduce:scroll-auto ${inter.className}`}>
    <body className="bg-base-100 text-base-content m-0 leading-relaxed">
      <Navbar
        name="chess"
        logoSrc={LOGO}
        links={NAV_LINKS}
        githubUrl={GITHUB}
      />
      {children}
      <Footer
        name="chess"
        tagline="Local chess engine · MIT licensed"
        githubUrl={GITHUB}
      />
    </body>
  </html>
);

export default RootLayout;
