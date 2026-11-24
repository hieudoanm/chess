import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  PiAppleLogo,
  PiBrain,
  PiDownloadSimple,
  PiFileZip,
  PiGoogleChromeLogo,
  PiLinuxLogo,
  PiTerminal,
  PiWindowsLogo,
} from 'react-icons/pi';
import { FaFirefox } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Downloads',
  description:
    'Download chess — the engine CLI and desktop tournament manager — for macOS, Windows, and Linux.',
  alternates: { canonical: '/downloads/' },
};

const GITHUB = 'https://github.com/hieudoanm/chess';
const RELEASES = `${GITHUB}/releases/latest/download`;
const RELEASE_PAGE = `${GITHUB}/releases/latest`;
const INSTALL_SH = `curl -fsSL ${GITHUB}/raw/master/scripts/install.sh`;

interface Asset {
  label: string;
  href: string;
}

interface Cell {
  name: string;
  icon: IconType;
  desc: string;
  assets: Asset[];
  guide?: string;
}

const CLI: Cell[] = [
  {
    name: 'macOS (Silicon)',
    icon: PiAppleLogo,
    desc: 'Apple Silicon Macs — M1 and later.',
    assets: [
      {
        label: 'Apple Silicon',
        href: `${RELEASES}/cli-chess-aarch64-apple-darwin`,
      },
    ],
  },
  {
    name: 'macOS (Intel)',
    icon: PiAppleLogo,
    desc: 'Intel-based Macs.',
    assets: [
      { label: 'Intel', href: `${RELEASES}/cli-chess-x86_64-apple-darwin` },
    ],
  },
  {
    name: 'Linux',
    icon: PiLinuxLogo,
    desc: 'x86_64 GNU/Linux distributions.',
    assets: [
      {
        label: 'x86_64',
        href: `${RELEASES}/cli-chess-x86_64-unknown-linux-gnu`,
      },
    ],
  },
  {
    name: 'Windows',
    icon: PiWindowsLogo,
    desc: 'Windows 10/11, x86_64.',
    assets: [
      {
        label: '.exe',
        href: `${RELEASES}/cli-chess-x86_64-pc-windows-msvc.exe`,
      },
    ],
  },
];

const DESKTOP: Cell[] = [
  {
    name: 'macOS (Silicon)',
    icon: PiAppleLogo,
    desc: 'Apple Silicon Macs — M1 and later.',
    guide: '/docs/guides/how-to-install-desktop-macos-silicon/',
    assets: [
      {
        label: '.dmg',
        href: `${RELEASES}/desktop-chess-aarch64-apple-darwin.dmg`,
      },
      {
        label: '.app.zip',
        href: `${RELEASES}/desktop-chess-aarch64-apple-darwin.app.zip`,
      },
    ],
  },
  {
    name: 'macOS (Intel)',
    icon: PiAppleLogo,
    desc: 'Intel-based Macs.',
    guide: '/docs/guides/how-to-install-desktop-macos-intel/',
    assets: [
      {
        label: '.dmg',
        href: `${RELEASES}/desktop-chess-x86_64-apple-darwin.dmg`,
      },
      {
        label: '.app.zip',
        href: `${RELEASES}/desktop-chess-x86_64-apple-darwin.app.zip`,
      },
    ],
  },
  {
    name: 'Linux',
    icon: PiLinuxLogo,
    desc: 'x86_64 GNU/Linux distributions.',
    guide: '/docs/guides/how-to-install-desktop-linux/',
    assets: [
      {
        label: '.deb',
        href: `${RELEASES}/desktop-chess-x86_64-unknown-linux-gnu.deb`,
      },
      {
        label: '.rpm',
        href: `${RELEASES}/desktop-chess-x86_64-unknown-linux-gnu.rpm`,
      },
      {
        label: '.AppImage',
        href: `${RELEASES}/desktop-chess-x86_64-unknown-linux-gnu.AppImage`,
      },
    ],
  },
  {
    name: 'Windows',
    icon: PiWindowsLogo,
    desc: 'Windows 10/11, x86_64.',
    guide: '/docs/guides/how-to-install-desktop-windows/',
    assets: [
      {
        label: '.msi',
        href: `${RELEASES}/desktop-chess-x86_64-pc-windows-msvc.msi`,
      },
      {
        label: 'setup .exe',
        href: `${RELEASES}/desktop-chess-x86_64-pc-windows-msvc-setup.exe`,
      },
    ],
  },
];

const EXT: Cell[] = [
  {
    name: 'Chrome',
    icon: PiGoogleChromeLogo,
    desc: 'Chrome / Edge / Chromium (.crx, .zip).',
    guide: '/docs/guides/how-to-install-extension-chromium/',
    assets: [
      {
        label: 'v3 .crx',
        href: `${RELEASES}/extension-browser-chess-unlocked-v3.crx`,
      },
      {
        label: 'v3 .zip',
        href: `${RELEASES}/extension-browser-chess-unlocked-v3.zip`,
      },
    ],
  },
  {
    name: 'Firefox',
    icon: FaFirefox,
    desc: 'Firefox (.xpi, .zip).',
    guide: '/docs/guides/how-to-install-extension-gecko/',
    assets: [
      {
        label: 'v2 .xpi',
        href: `${RELEASES}/extension-browser-chess-unlocked-v2.xpi`,
      },
      {
        label: 'v2 .zip',
        href: `${RELEASES}/extension-browser-chess-unlocked-v2.zip`,
      },
    ],
  },
  {
    name: 'Source',
    icon: PiFileZip,
    desc: 'Unpacked extension source (.zip).',
    assets: [
      {
        label: 'v3 .zip',
        href: `${RELEASES}/extension-browser-chess-unlocked-v3.zip`,
      },
      {
        label: 'v2 .zip',
        href: `${RELEASES}/extension-browser-chess-unlocked-v2.zip`,
      },
    ],
  },
];

const MODELS: Cell[] = [];

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-12 last:mb-0">
      <h2 className="text-base-content mb-6 flex items-center gap-2 text-2xl leading-tight">
        <Icon className="text-primary h-6 w-6" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function CardGrid({ cells, cols }: { cells: Cell[]; cols: string }) {
  const visible = cells.filter((c) => c.assets.length > 0);
  if (visible.length === 0) return null;
  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${cols}`}>
      {visible.map((c) => (
        <div
          key={c.name}
          className="card border-base-300 bg-base-100 border p-6">
          <div className="bg-primary/10 text-primary mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg">
            <c.icon className="h-6 w-6" />
          </div>
          <h3 className="text-base-content m-0 text-lg leading-tight">
            {c.name}
          </h3>
          <p className="text-base-content/60 mt-1 truncate text-sm">{c.desc}</p>
          <div className="mt-4 flex flex-col gap-2">
            {c.assets.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="btn btn-primary btn-sm gap-2">
                <PiDownloadSimple className="h-3.5 w-3.5" />
                {a.label}
              </a>
            ))}
          </div>
          {c.guide && (
            <Link
              href={c.guide}
              className="text-primary mt-3 inline-block text-xs">
              How to install →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

const Downloads: FC = () => (
  <main>
    <section className="py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="m-0 text-4xl leading-tight tracking-normal text-balance">
            Download chess
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            The UCI-compatible engine with alpha-beta search and an MCP server,
            the Chess desktop tournament manager, and the Chess Unlocked browser
            extension.
          </p>
          <p className="mt-3 text-lg text-gray-500">
            Assets are in the{' '}
            <a href={RELEASE_PAGE} className="text-primary">
              latest release
            </a>
            .
          </p>
        </div>

        <Section icon={PiTerminal} title="CLI">
          <CardGrid cells={CLI} cols="lg:grid-cols-4" />
        </Section>

        <Section icon={PiDownloadSimple} title="Desktop">
          <CardGrid cells={DESKTOP} cols="lg:grid-cols-4" />
          <p className="text-base-content/60 mt-4 text-sm">
            Desktop builds are the Chess app — a Tauri tournament manager with
            local SQLite (sql.js). Step-by-step guides:{' '}
            <Link
              href="/docs/guides/how-to-install-desktop-macos-silicon/"
              className="text-primary">
              macOS
            </Link>
            {' · '}
            <Link
              href="/docs/guides/how-to-install-desktop-linux/"
              className="text-primary">
              Linux
            </Link>
            {' · '}
            <Link
              href="/docs/guides/how-to-install-desktop-windows/"
              className="text-primary">
              Windows
            </Link>
            .
          </p>
        </Section>

        <Section icon={PiGoogleChromeLogo} title="Browser Extension">
          <CardGrid cells={EXT} cols="lg:grid-cols-3" />
          <p className="text-base-content/60 mt-4 text-sm">
            Chess Unlocked adds free Lichess.org alternatives to Chess.com
            premium features. Step-by-step guides:{' '}
            <Link
              href="/docs/guides/how-to-install-extension-chromium/"
              className="text-primary">
              Chromium
            </Link>
            {' · '}
            <Link
              href="/docs/guides/how-to-install-extension-gecko/"
              className="text-primary">
              Firefox
            </Link>
            .
          </p>
        </Section>

        {MODELS.length > 0 && (
          <Section icon={PiBrain} title="Models">
            <CardGrid cells={MODELS} cols="lg:grid-cols-3" />
          </Section>
        )}

        <div className="border-base-300 bg-base-200/50 mt-12 rounded-2xl border p-6">
          <h2 className="text-base-content m-0 mb-2 flex items-center gap-2 text-lg leading-tight">
            <PiAppleLogo className="text-primary h-5 w-5" />
            macOS: unsigned app workaround
          </h2>
          <p className="text-base-content/60 mb-4 text-sm">
            The macOS builds are not signed or notarized, so Gatekeeper will
            block the first launch. Either right-click the app and choose{' '}
            <strong>Open</strong>, or remove the quarantine attribute:
          </p>
          <pre className="bg-base-300 overflow-x-auto rounded-lg p-4 font-mono text-sm">
            <code>xattr -dr com.apple.quarantine /Applications/Chess.app</code>
          </pre>
        </div>

        <div className="border-base-300 bg-base-200/50 rounded-2xl border p-6">
          <h2 className="text-base-content m-0 mb-2 flex items-center gap-2 text-lg leading-tight">
            <PiTerminal className="text-primary h-5 w-5" />
            Install script
          </h2>
          <p className="text-base-content/60 mb-4 text-sm">
            Downloads the right prebuilt binary or desktop installer, or builds
            from source if no release matches your platform. Pass{' '}
            <code>--firefox</code> or <code>--chrome</code> to install the
            browser extension instead. Installs to <code>~/.local/bin</code>.
          </p>
          <pre className="bg-base-300 overflow-x-auto rounded-lg p-4 font-mono text-sm">
            <code>{INSTALL_SH}</code>
          </pre>
        </div>
      </div>
    </section>
  </main>
);

export default Downloads;
