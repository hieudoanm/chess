import { render, screen, fireEvent } from '@testing-library/react';
import ResetPasswordPage from '../page';

describe('ResetPasswordPage', () => {
  it('renders the reset-password form', () => {
    render(<ResetPasswordPage />);
    expect(
      screen.getByRole('heading', { name: 'Reset password' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
  });

  it('shows a link back to sign in', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    );
  });

  it('toggles password visibility', () => {
    render(<ResetPasswordPage />);
    const password = screen.getByLabelText('New password');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('shows an error when fields are empty', () => {
    render(<ResetPasswordPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(screen.getByText('Enter your new password.')).toBeInTheDocument();
  });

  it('shows an error when passwords do not match', () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'one' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'two' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
  });

  it('shows a success message when submitting valid fields', () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'secret' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(
      screen.getByText('Your password has been reset.')
    ).toBeInTheDocument();
  });
});
