'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { FiDownload, FiGrid, FiLayout } from 'react-icons/fi';

interface DownloadItem {
  platform: string;
  requirements: string;
  label: string;
  href: string;
}

type DownloadsTemplateMode = 'full' | 'minimal';

const OS_ORDER = ['Android', 'Linux', 'macOS', 'Windows'] as const;

const MINIMAL_LABELS: Record<(typeof OS_ORDER)[number], string> = {
  Android: '.apk',
  Linux: '.AppImage',
  macOS: '.dmg',
  Windows: '.exe',
};

interface DownloadsTemplateProps {
  version: string;
  items: DownloadItem[];
  mode?: DownloadsTemplateMode;
}

const osName = (platform: string): string => platform.split(' ')[0];

const pickMinimal = (items: DownloadItem[]): DownloadItem[] =>
  OS_ORDER.map((os) =>
    items.find(
      (item) =>
        osName(item.platform) === os && item.label === MINIMAL_LABELS[os]
    )
  ).filter((item): item is DownloadItem => item !== undefined);

const groupByOS = (items: DownloadItem[]) => {
  const groups = new Map<string, DownloadItem[]>();
  for (const item of items) {
    const os = osName(item.platform);
    const list = groups.get(os) ?? [];
    list.push(item);
    groups.set(os, list);
  }

  const ordered = new Map<string, DownloadItem[]>();
  for (const os of OS_ORDER) {
    const list = groups.get(os);
    if (list) ordered.set(os, list);
  }
  for (const [os, list] of groups) {
    if (!ordered.has(os)) ordered.set(os, list);
  }
  return ordered;
};

const DownloadButton: FC<Pick<DownloadItem, 'href' | 'label'>> = ({
  href,
  label,
}) => (
  <Link
    href={href}
    className="btn btn-primary btn-sm gap-1.5"
    aria-label={`Download ${label}`}>
    <FiDownload className="h-3.5 w-3.5" />
    {label}
  </Link>
);

DownloadButton.displayName = 'DownloadButton';

interface DownloadRowProps {
  item: DownloadItem;
  showPlatform?: boolean;
}

const DownloadRow: FC<DownloadRowProps> = ({ item, showPlatform = true }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="text-left">
      {showPlatform && (
        <span className="text-base-content block text-sm font-bold">
          {item.platform}
        </span>
      )}
      <span className="text-base-content/50 block text-xs">
        {item.requirements}
      </span>
    </div>
    <DownloadButton href={item.href} label={item.label} />
  </div>
);

DownloadRow.displayName = 'DownloadRow';

const MinimalDownloads: FC<{ items: DownloadItem[] }> = ({ items }) => (
  <div className="mx-auto flex w-full max-w-md items-stretch">
    <div className="card bg-base-200 border-base-content/10 flex w-full flex-col gap-4 rounded-2xl border p-6">
      {items.map((item) => (
        <DownloadRow key={`${item.platform}-${item.label}`} item={item} />
      ))}
    </div>
  </div>
);

MinimalDownloads.displayName = 'MinimalDownloads';

const DownloadsSection: FC<{ os: string; items: DownloadItem[] }> = ({
  os,
  items,
}) => (
  <section className="border-base-content/10 bg-base-200 flex w-full flex-col gap-4 rounded-2xl border p-6">
    <h2 className="text-base-content text-start text-sm font-bold tracking-[0.2em] uppercase">
      {os}
    </h2>

    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <DownloadRow
          key={`${item.platform}-${item.label}`}
          item={item}
          showPlatform={item.platform !== os}
        />
      ))}
    </div>
  </section>
);

DownloadsSection.displayName = 'DownloadsSection';

const DownloadsMeta: FC<{ version: string }> = ({ version }) => (
  <div className="flex flex-wrap justify-center gap-3">
    <span className="border-base-content/20 text-base-content/50 rounded-full border px-3 py-1 text-xs">
      {version}
    </span>
    <span className="badge badge-neutral rounded-full">Stable</span>
  </div>
);

DownloadsMeta.displayName = 'DownloadsMeta';

const DownloadsHeader: FC = () => (
  <>
    <p className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
      Downloads
    </p>

    <h1 className="mb-1">Installers</h1>

    <p className="text-base-content/50 max-w-sm text-sm">
      Pick the package for your platform. The mobile web app is available from
      any browser.
    </p>
  </>
);

DownloadsHeader.displayName = 'DownloadsHeader';

interface ModeToggleProps {
  isMinimal: boolean;
  onToggle: () => void;
}

const ModeToggle: FC<ModeToggleProps> = ({ isMinimal, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={`Switch to ${isMinimal ? 'full' : 'minimal'} view`}
    className="btn btn-outline btn-sm gap-1.5">
    {isMinimal ? (
      <FiLayout className="h-3.5 w-3.5" />
    ) : (
      <FiGrid className="h-3.5 w-3.5" />
    )}
    {isMinimal ? 'Full view' : 'Minimal view'}
  </button>
);

ModeToggle.displayName = 'ModeToggle';

const FullDownloads: FC<{ version: string; items: DownloadItem[] }> = ({
  version,
  items,
}) => {
  const sections = groupByOS(items);

  return (
    <>
      <div className="flex w-full max-w-lg flex-col gap-6">
        {[...sections.entries()].map(([os, osItems]) => (
          <DownloadsSection key={os} os={os} items={osItems} />
        ))}
      </div>

      <DownloadsMeta version={version} />
    </>
  );
};

FullDownloads.displayName = 'FullDownloads';

export const DownloadsTemplate: FC<DownloadsTemplateProps> = ({
  version,
  items,
  mode = 'minimal',
}) => {
  const [currentMode, setCurrentMode] = useState<DownloadsTemplateMode>(mode);
  const isMinimal = currentMode === 'minimal';

  const toggle = () =>
    setCurrentMode((prev) => (prev === 'minimal' ? 'full' : 'minimal'));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-16 text-center">
      <DownloadsHeader />
      <ModeToggle isMinimal={isMinimal} onToggle={toggle} />
      {isMinimal ? (
        <MinimalDownloads items={pickMinimal(items)} />
      ) : (
        <FullDownloads version={version} items={items} />
      )}
    </div>
  );
};

DownloadsTemplate.displayName = 'DownloadsTemplate';
