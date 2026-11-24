import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from '../page';

describe('SignUpPage', () => {
  it('renders the sign-up form', () => {
    render(<SignUpPage />);
    expect(
      screen.getByRole('heading', { name: 'Create account' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
  });

  it('shows a link to sign in', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    );
  });

  it('toggles password visibility', () => {
    render(<SignUpPage />);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('shows an error when fields are empty', () => {
    render(<SignUpPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('shows an error when passwords do not match', () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Alex' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'one' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'two' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
  });

  it('shows a success message when submitting valid fields', () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Alex' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(
      screen.getByText('Account created successfully.')
    ).toBeInTheDocument();
  });
});
