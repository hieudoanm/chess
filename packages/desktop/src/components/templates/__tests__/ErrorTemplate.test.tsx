import { render, screen } from '@testing-library/react';
import { ErrorTemplate } from '../ErrorTemplate';

describe('ErrorTemplate', () => {
  it('renders error code', () => {
    render(<ErrorTemplate code="500" />);
    expect(screen.getByText('500')).toBeTruthy();
  });

  it('renders Error label', () => {
    render(<ErrorTemplate code="500" />);
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('renders description when provided', () => {
    render(<ErrorTemplate code="500" description="Server error" />);
    expect(screen.getByText('Server error')).toBeTruthy();
  });

  it('does not render description when not provided', () => {
    render(<ErrorTemplate code="500" />);
    expect(screen.queryByText('Server error')).toBeNull();
  });

  it('renders action when provided', () => {
    render(<ErrorTemplate code="500" action={<button>Retry</button>} />);
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('does not render action when not provided', () => {
    render(<ErrorTemplate code="500" />);
    expect(screen.queryByText('Retry')).toBeNull();
  });
});
