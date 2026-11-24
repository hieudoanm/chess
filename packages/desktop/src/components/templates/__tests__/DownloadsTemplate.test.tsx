import { fireEvent, render, screen } from '@testing-library/react';
import { DownloadsTemplate } from '../DownloadsTemplate';

const PROPS = {
  version: 'v0.0.1',
  items: [
    {
      platform: 'Android',
      requirements: 'Android 14.+',
      label: '.aab',
      href: 'https://example.com/app.aab',
    },
    {
      platform: 'Android',
      requirements: 'Android 14.+',
      label: '.apk',
      href: 'https://example.com/app.apk',
    },
    {
      platform: 'macOS',
      requirements: 'Apple Silicon · macOS 13.+',
      label: '.dmg',
      href: 'https://example.com/app.dmg',
    },
    {
      platform: 'Linux',
      requirements: 'Ubuntu 22.04.+',
      label: '.AppImage',
      href: 'https://example.com/app.AppImage',
    },
    {
      platform: 'Linux',
      requirements: 'Fedora 40.+',
      label: '.rpm',
      href: 'https://example.com/app.rpm',
    },
    {
      platform: 'Linux (Debian)',
      requirements: 'Debian 13.+',
      label: '.deb',
      href: 'https://example.com/app.deb',
    },
    {
      platform: 'Windows',
      requirements: 'Windows 10.+',
      label: '.exe',
      href: 'https://example.com/app.exe',
    },
    {
      platform: 'Windows',
      requirements: 'Windows 10.+',
      label: '.msi',
      href: 'https://example.com/app.msi',
    },
  ],
};

describe('DownloadsTemplate', () => {
  describe('default (minimal) view', () => {
    it('renders the header part', () => {
      render(<DownloadsTemplate {...PROPS} />);
      expect(screen.getByText('Downloads')).toBeInTheDocument();
      expect(screen.getByText('Installers')).toBeInTheDocument();
    });

    it('renders a single card', () => {
      const { container } = render(<DownloadsTemplate {...PROPS} />);
      expect(container.querySelector('.card')).toBeInTheDocument();
      expect(container.querySelectorAll('.card')).toHaveLength(1);
    });

    it('renders only the canonical download for each operating system', () => {
      render(<DownloadsTemplate {...PROPS} />);

      expect(
        screen.getByRole('link', { name: 'Download .apk' })
      ).toHaveAttribute('href', 'https://example.com/app.apk');
      expect(
        screen.getByRole('link', { name: 'Download .AppImage' })
      ).toHaveAttribute('href', 'https://example.com/app.AppImage');
      expect(
        screen.getByRole('link', { name: 'Download .dmg' })
      ).toHaveAttribute('href', 'https://example.com/app.dmg');
      expect(
        screen.getByRole('link', { name: 'Download .exe' })
      ).toHaveAttribute('href', 'https://example.com/app.exe');
    });

    it('does not render secondary package variants', () => {
      render(<DownloadsTemplate {...PROPS} />);

      expect(
        screen.queryByRole('link', { name: 'Download .aab' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Download .rpm' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Download .deb' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Download .msi' })
      ).not.toBeInTheDocument();
    });
  });

  describe('full view', () => {
    it('renders one section per operating system in order', () => {
      const { container } = render(
        <DownloadsTemplate mode="full" {...PROPS} />
      );

      for (const os of ['Android', 'macOS', 'Linux', 'Windows']) {
        expect(
          screen.getByRole('heading', { level: 2, name: os })
        ).toBeInTheDocument();
      }
      expect(container.querySelectorAll('section')).toHaveLength(4);
    });

    it('renders platform variants only when they differ from their section', () => {
      render(<DownloadsTemplate mode="full" {...PROPS} />);

      expect(screen.getByText('Linux (Debian)')).toBeInTheDocument();
      expect(screen.queryAllByText('Android').length).toBe(1);
      expect(screen.queryAllByText('Windows').length).toBe(1);
    });

    it('renders requirements and download links per item', () => {
      render(<DownloadsTemplate mode="full" {...PROPS} />);

      expect(
        screen.getByText('Apple Silicon · macOS 13.+')
      ).toBeInTheDocument();
      expect(screen.getByText('Debian 13.+')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Download .dmg' })
      ).toHaveAttribute('href', 'https://example.com/app.dmg');
      expect(
        screen.getByRole('link', { name: 'Download .msi' })
      ).toHaveAttribute('href', 'https://example.com/app.msi');
    });

    it('renders version and stable badge', () => {
      render(<DownloadsTemplate mode="full" {...PROPS} />);
      expect(screen.getByText('v0.0.1')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('appends sections for platforms outside the known operating systems', () => {
      render(
        <DownloadsTemplate
          mode="full"
          version="v0.0.1"
          items={[
            {
              platform: 'Haiku',
              requirements: 'x86_64',
              label: '.hpkg',
              href: 'https://example.com/app.hpkg',
            },
          ]}
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: 'Haiku' })
      ).toBeInTheDocument();
    });

    it('omits sections for operating systems without items', () => {
      render(
        <DownloadsTemplate
          mode="full"
          version="v0.0.1"
          items={[
            {
              platform: 'Android',
              requirements: 'Android 14.+',
              label: '.aab',
              href: 'https://example.com/app.aab',
            },
          ]}
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: 'Android' })
      ).toBeInTheDocument();
      expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(1);
    });
  });

  describe('toggle button', () => {
    it('toggles from minimal to full and back', () => {
      render(<DownloadsTemplate {...PROPS} />);

      expect(
        screen.getByRole('link', { name: 'Download .apk' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Download .rpm' })
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /full view/i }));

      expect(
        screen.getByRole('link', { name: 'Download .rpm' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Download .msi' })
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /minimal view/i }));

      expect(
        screen.getByRole('link', { name: 'Download .apk' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Download .rpm' })
      ).not.toBeInTheDocument();
    });
  });
});
