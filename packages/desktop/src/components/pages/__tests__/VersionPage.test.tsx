import { fireEvent, render, screen } from '@testing-library/react';
import { VersionPage } from '@/components/pages/VersionPage';

jest.mock('next/navigation', () => ({
  usePathname: () => '/version',
}));

describe('VersionPage', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('renders the version page with segments and copies on click', async () => {
    render(<VersionPage />);
    expect(await screen.findByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy version' }));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
