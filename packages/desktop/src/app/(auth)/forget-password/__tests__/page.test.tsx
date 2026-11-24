import { render, screen, fireEvent } from '@testing-library/react';
import ForgetPasswordPage from '../page';

describe('ForgetPasswordPage', () => {
  it('renders the forgot-password form', () => {
    render(<ForgetPasswordPage />);
    expect(
      screen.getByRole('heading', { name: 'Forgot password' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows a link back to sign in', () => {
    render(<ForgetPasswordPage />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    );
  });

  it('shows an error when email is empty', () => {
    render(<ForgetPasswordPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
  });

  it('shows a success message when submitting an email', () => {
    render(<ForgetPasswordPage />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'you@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(
      screen.getByText('If that email exists, a reset link has been sent.')
    ).toBeInTheDocument();
  });
});
