import { render, screen } from '@testing-library/react';
import { AboutPage } from '@/components/pages/AboutPage';

jest.mock('next/navigation', () => ({
  usePathname: () => '/about',
}));

describe('AboutPage', () => {
  it('renders the about page', () => {
    render(<AboutPage />);
    expect(screen.getByText('Tourney')).toBeInTheDocument();
    expect(screen.getByText('Framework')).toBeInTheDocument();
    expect(screen.getByText('Next.js 16.+')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });
});
