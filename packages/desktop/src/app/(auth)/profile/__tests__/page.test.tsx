import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from '../page';

describe('ProfilePage', () => {
  it('renders the profile page with account fields', () => {
    render(<ProfilePage />);
    expect(
      screen.getByRole('heading', { name: 'Profile' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows a link to sign out', () => {
    render(<ProfilePage />);
    expect(screen.getByRole('link', { name: 'Sign out' })).toHaveAttribute(
      'href',
      '/sign-in'
    );
  });

  it('shows a success message when saving changes', () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Changes saved.')).toBeInTheDocument();
  });
});
