import type { Metadata } from 'next';
import type { FC } from 'react';
import type { IconType } from 'react-icons';
import {
  FaApple,
  FaDownload,
  FaLinux,
  FaTerminal,
  FaWindows,
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Downloads',
  description:
    'Download the chess engine CLI for macOS, Windows, and Linux, or install it with the setup script.',
  alternates: { canonical: '/downloads/' },
};

const GITHUB = 'https://github.com/hieudoanm/chess';
const RELEASES = `${GITHUB}/releases/latest/download`;
const RELEASE_PAGE = `${GITHUB}/releases/latest`;
const INSTALL_SH = `curl -fsSL ${GITHUB}/raw/master/scripts/install.sh | bash`;

interface Platform {
  name: string;
  icon: IconType;
  assets: { label: string; href: string }[];
}

const PLATFORMS: Platform[] = [
  {
    name: 'macOS',
    icon: FaApple,
    assets: [
      {
        label: 'Apple Silicon',
        href: `${RELEASES}/cli-chess-aarch64-apple-darwin`,
      },
    ],
  },
  {
    name: 'Windows',
    icon: FaWindows,
    assets: [
      {
        label: '.exe',
        href: `${RELEASES}/cli-chess-x86_64-pc-windows-msvc.exe`,
      },
    ],
  },
  {
    name: 'Linux',
    icon: FaLinux,
    assets: [
      {
        label: 'x86_64',
        href: `${RELEASES}/cli-chess-x86_64-unknown-linux-gnu`,
      },
    ],
  },
];

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
            as a single binary. Assets are in the{' '}
            <a href={RELEASE_PAGE} className="text-primary">
              latest release
            </a>
            .
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="card border-base-300 bg-base-100 border p-6">
              <div className="bg-primary/10 text-primary mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg">
                <p.icon className="h-6 w-6" />
              </div>
              <h2 className="text-base-content m-0 mb-1 text-lg leading-tight">
                {p.name}
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                {p.assets.map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    className="btn btn-primary btn-sm gap-2">
                    <FaDownload className="h-3.5 w-3.5" />
                    {a.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-base-300 bg-base-200/50 rounded-2xl border p-6">
          <h2 className="text-base-content m-0 mb-2 flex items-center gap-2 text-lg leading-tight">
            <FaTerminal className="text-primary h-5 w-5" />
            Install script
          </h2>
          <p className="text-base-content/60 mb-4 text-sm">
            Downloads the right prebuilt binary, or builds from source if no
            release matches your platform. Installs to <code>~/.local/bin</code>
            .
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
