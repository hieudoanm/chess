'use client';

import type { FC } from 'react';

const GlobalError: FC<{
  error: Error & { digest?: string };
  reset: () => void;
}> = ({ error, reset }) => (
  <html lang="en">
    <body>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-base-content/60">{error.message}</p>
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </main>
    </body>
  </html>
);

export default GlobalError;
