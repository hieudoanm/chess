import { render, screen } from '@testing-library/react';
import DownloadsPage from '../page';

describe('DownloadsPage', () => {
  it('renders the downloads heading', () => {
    render(<DownloadsPage />);
    expect(screen.getByText('Installers')).toBeInTheDocument();
  });

  it('renders only the canonical download link for each platform', () => {
    render(<DownloadsPage />);
    expect(
      screen.getByRole('link', { name: 'Download .apk' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Download .AppImage' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Download .dmg' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Download .exe' })
    ).toBeInTheDocument();
  });

  it('does not render secondary package variants', () => {
    render(<DownloadsPage />);
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

  it('renders download links with correct hrefs', () => {
    render(<DownloadsPage />);
    expect(screen.getByRole('link', { name: 'Download .apk' })).toHaveAttribute(
      'href',
      expect.stringContaining('tourney.apk')
    );
    expect(
      screen.getByRole('link', { name: 'Download .AppImage' })
    ).toHaveAttribute('href', expect.stringContaining('tourney.AppImage'));
    expect(screen.getByRole('link', { name: 'Download .dmg' })).toHaveAttribute(
      'href',
      expect.stringContaining('tourney.dmg')
    );
    expect(screen.getByRole('link', { name: 'Download .exe' })).toHaveAttribute(
      'href',
      expect.stringContaining('tourney.exe')
    );
  });
});
