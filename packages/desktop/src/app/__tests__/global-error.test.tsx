import { render, screen, fireEvent } from '@testing-library/react';
import GlobalErrorPage from '../global-error';

describe('GlobalErrorPage', () => {
  it('renders 500 and try again button', () => {
    const reset = jest.fn();
    render(<GlobalErrorPage error={new Error('test')} reset={reset} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('calls reset when try again is clicked', () => {
    const reset = jest.fn();
    render(<GlobalErrorPage error={new Error('test')} reset={reset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalled();
  });
});
