'use client';

import { ErrorTemplate } from '@/components/templates/ErrorTemplate';

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <ErrorTemplate
    code="500"
    description="Something went wrong."
    action={
      <button className="btn btn-primary btn-sm" onClick={() => reset()}>
        Try again
      </button>
    }
  />
);

export default ErrorPage;
