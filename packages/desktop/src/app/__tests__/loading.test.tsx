import { render } from '@testing-library/react';
import LoadingPage from '@/app/loading';

describe('LoadingPage', () => {
  it('renders spinner', () => {
    const { container } = render(<LoadingPage />);
    expect(container.querySelector('.loading')).toBeInTheDocument();
  });
});
