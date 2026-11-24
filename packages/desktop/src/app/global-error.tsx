'use client';

import { ErrorTemplate } from '@/components/templates/ErrorTemplate';

const GlobalErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <html lang="en">
    <body className="bg-base-100 text-base-content">
      <ErrorTemplate
        code="500"
        description="Something went wrong."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => reset()}>
            Try again
          </button>
        }
      />
    </body>
  </html>
);

export default GlobalErrorPage;
