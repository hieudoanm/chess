import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/atoms/EmptyState';

describe('EmptyState', () => {
  it('renders title without optional sections', () => {
    render(<EmptyState icon={<span>i</span>} title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders description and action when provided', () => {
    render(
      <EmptyState
        icon={<span>i</span>}
        title="No data"
        description="Nothing here yet"
        action={<button>Create</button>}
      />
    );
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
