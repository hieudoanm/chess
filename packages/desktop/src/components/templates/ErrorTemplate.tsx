import type { FC, ReactNode } from 'react';

interface ErrorTemplateProps {
  code: string;
  description?: string;
  action?: ReactNode;
}

export const ErrorTemplate: FC<ErrorTemplateProps> = ({
  code,
  description,
  action,
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6">
    <p className="text-base-content/50 mb-6 text-xs tracking-[0.2em] uppercase">
      Error
    </p>

    <h1 className="mb-3">{code}</h1>

    {description && (
      <p className="text-base-content/50 mb-10 max-w-sm text-center text-sm">
        {description}
      </p>
    )}

    {action && (
      <div className="flex flex-wrap justify-center gap-3">{action}</div>
    )}
  </div>
);

ErrorTemplate.displayName = 'ErrorTemplate';
