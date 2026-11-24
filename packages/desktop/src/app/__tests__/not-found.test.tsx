import { render, screen } from '@testing-library/react';
import NotFoundPage from '../not-found';

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('NotFoundPage', () => {
  it('renders 404 and the page not found message', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByText('The page you are looking for does not exist.')
    ).toBeInTheDocument();
  });

  it('renders go home link', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('Go home')).toHaveAttribute('href', '/');
  });
});
