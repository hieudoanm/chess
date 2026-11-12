import type { FC } from 'react';

const Loading: FC = () => (
  <main className="flex min-h-dvh items-center justify-center">
    <span className="loading loading-spinner loading-lg text-primary" />
  </main>
);

export default Loading;
