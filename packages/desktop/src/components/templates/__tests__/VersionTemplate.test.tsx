import { fireEvent, render, screen } from '@testing-library/react';
import { VersionTemplate } from '../VersionTemplate';

describe('VersionTemplate', () => {
  it('renders heading and copy button', () => {
    render(<VersionTemplate version="2026.08.09.10.20.30" />);
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Copy version/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('renders date segments for a timestamp version', () => {
    render(<VersionTemplate version="2026.08.09.10.20.30" />);
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
  });

  it('copies version to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    render(<VersionTemplate version="2026.08.09.10.20.30" />);
    fireEvent.click(screen.getByRole('button', { name: /Copy version/i }));
    await screen.findByText('Copied');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '2026.08.09.10.20.30'
    );
  });

  it('falls back to raw version text for non-timestamp versions', () => {
    render(<VersionTemplate version="v0.0.1" />);
    expect(screen.getByText('v0.0.1')).toBeInTheDocument();
  });
});
