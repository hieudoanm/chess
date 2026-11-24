'use client';

import type { FC, ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingRow: FC<SettingRowProps> = ({ label, description, children }) => (
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

interface SettingSectionProps {
  title: string;
  children: ReactNode;
}

const SettingSection: FC<SettingSectionProps> = ({ title, children }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
      {title}
    </h2>
    <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  </div>
);

interface SettingsTemplateProps {
  language: string;
  theme: string;
  dateTimeFormat: string;
  timezone: string;
  onLanguageChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onDateTimeFormatChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export const SettingsTemplate: FC<SettingsTemplateProps> = ({
  language,
  theme,
  dateTimeFormat,
  timezone,
  onLanguageChange,
  onThemeChange,
  onDateTimeFormatChange,
  onTimezoneChange,
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
    <p className="text-base-content/50 mb-6 text-xs tracking-[0.2em] uppercase">
      Settings
    </p>

    <h1 className="mb-3">Settings</h1>

    <p className="text-base-content/50 mb-10 max-w-sm text-center text-sm">
      Customize your experience
    </p>

    <div className="container mx-auto flex flex-col gap-6">
      <SettingSection title="Language">
        <SettingRow
          label="Language"
          description="Select your preferred language">
          <select
            className="select select-bordered select-sm w-40"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}>
            <option value="en">English</option>
            <option value="vi">Tieng Viet</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Appearance">
        <SettingRow label="Theme" description="Choose your color theme">
          <select
            className="select select-bordered select-sm w-40"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}>
            <option value="nothing">Nothing</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="night">Night</option>
            <option value="dim">Dim</option>
            <option value="dracula">Dracula</option>
            <option value="nord">Nord</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Date & Time">
        <SettingRow
          label="Date/Time Format"
          description="How dates and times are displayed">
          <select
            className="select select-bordered select-sm w-40"
            value={dateTimeFormat}
            onChange={(e) => onDateTimeFormatChange(e.target.value)}>
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
            <option value="iso">ISO 8601</option>
            <option value="relative">Relative</option>
          </select>
        </SettingRow>

        <SettingRow label="Timezone" description="Your local timezone">
          <select
            className="select select-bordered select-sm w-40"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Seoul">Seoul (KST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (ICT)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </SettingRow>
      </SettingSection>
    </div>
  </div>
);

SettingsTemplate.displayName = 'SettingsTemplate';
