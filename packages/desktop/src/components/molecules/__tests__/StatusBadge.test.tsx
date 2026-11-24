import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/molecules/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['draft', 'Draft'],
    ['in-progress', 'In Progress'],
    ['completed', 'Completed'],
    ['cancelled', 'Cancelled'],
    ['scheduled', 'Scheduled'],
    ['walkover', 'Walkover'],
  ] as const)('renders %s status', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
