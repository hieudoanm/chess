import { FC } from 'react';

const LoadingPage: FC = () => (
  <div className="flex h-screen items-center justify-center">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
);

export default LoadingPage;
