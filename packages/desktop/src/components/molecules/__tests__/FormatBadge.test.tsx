import { render, screen } from '@testing-library/react';
import { FormatBadge } from '@/components/molecules/FormatBadge';

describe('FormatBadge', () => {
  it('renders a label for each tournament format', () => {
    render(<FormatBadge format="single-elimination" />);
    expect(screen.getByText('Single Elimination')).toBeInTheDocument();
  });

  it('renders the swiss label', () => {
    render(<FormatBadge format="swiss" />);
    expect(screen.getByText('Swiss')).toBeInTheDocument();
  });
});
