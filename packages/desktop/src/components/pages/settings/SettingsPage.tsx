'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { SettingRow } from './SettingRow';
import { SettingSection } from './SettingSection';
import type { TournamentFormat } from '@/types';

export const SettingsPage: FC = () => {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('nothing');
  const [dateTimeFormat, setDateTimeFormat] = useState('24h');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultFormat, setDefaultFormat] =
    useState<TournamentFormat>('single-elimination');
  const [defaultMaxParticipants, setDefaultMaxParticipants] = useState(16);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex min-h-dvh flex-col items-center px-6 pt-24 pb-20">
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
              onChange={(e) => setLanguage(e.target.value)}>
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
              onChange={(e) => setTheme(e.target.value)}>
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
              onChange={(e) => setDateTimeFormat(e.target.value)}>
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
              onChange={(e) => setTimezone(e.target.value)}>
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

        <SettingSection title="Tournament Defaults">
          <SettingRow
            label="Default Format"
            description="Pre-selected format when creating">
            <select
              className="select select-bordered select-sm w-40"
              value={defaultFormat}
              onChange={(e) =>
                setDefaultFormat(e.target.value as TournamentFormat)
              }>
              <option value="single-elimination">Single Elimination</option>
              <option value="double-elimination">Double Elimination</option>
              <option value="round-robin">Round Robin</option>
              <option value="swiss">Swiss System</option>
              <option value="group-stage">Group Stage</option>
              <option value="league">League</option>
            </select>
          </SettingRow>

          <SettingRow
            label="Default Max Participants"
            description="Pre-selected participant limit">
            <select
              className="select select-bordered select-sm w-40"
              value={defaultMaxParticipants}
              onChange={(e) =>
                setDefaultMaxParticipants(Number(e.target.value))
              }>
              {[4, 8, 16, 32, 64].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            label="Auto-save"
            description="Automatically save changes">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
          </SettingRow>
        </SettingSection>
      </div>

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};
