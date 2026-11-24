import type { FC } from 'react';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingSection: FC<SettingSectionProps> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
      {title}
    </h2>
    <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  </div>
);
