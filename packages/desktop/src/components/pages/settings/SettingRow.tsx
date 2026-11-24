import type { FC } from 'react';

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingRow: FC<SettingRowProps> = ({
  label,
  description,
  children,
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="text-base-content text-sm font-medium">{label}</span>
      {description && (
        <span className="text-base-content/50 text-xs">{description}</span>
      )}
    </div>
    {children}
  </div>
);
