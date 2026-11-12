import Link from 'next/link';
import type { FC } from 'react';

const NotFound: FC = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
    <h1 className="text-3xl font-bold">404</h1>
    <p className="text-base-content/60">This page does not exist.</p>
    <Link href="/" className="btn btn-primary">
      Back home
    </Link>
  </main>
);

export default NotFound;
