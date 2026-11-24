import { render, screen, fireEvent } from '@testing-library/react';
import SignInPage from '../page';

describe('SignInPage', () => {
  it('renders the sign-in form', () => {
    render(<SignInPage />);
    expect(
      screen.getByRole('heading', { name: 'Sign in' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows a link to sign up', () => {
    render(<SignInPage />);
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/sign-up'
    );
  });

  it('toggles password visibility', () => {
    render(<SignInPage />);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('shows an error when fields are empty', () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      screen.getByText('Enter your email and password.')
    ).toBeInTheDocument();
  });

  it('shows a success message when submitting valid fields', () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'you@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Signed in successfully.')).toBeInTheDocument();
  });
});
