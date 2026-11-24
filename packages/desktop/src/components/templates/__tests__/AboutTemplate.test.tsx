import { render, screen } from '@testing-library/react';
import { AboutTemplate } from '../AboutTemplate';

const PROPS = {
  name: 'Test App',
  description: 'A test application',
  version: 'v0.0.1',
  items: [
    { label: 'Framework', value: 'Next.js' },
    { label: 'Shell', value: 'Tauri' },
  ],
};

describe('AboutTemplate', () => {
  it('renders the About label', () => {
    render(<AboutTemplate {...PROPS} />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders the name and description', () => {
    render(<AboutTemplate {...PROPS} />);
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('A test application')).toBeInTheDocument();
  });

  it('renders item labels and values', () => {
    render(<AboutTemplate {...PROPS} />);
    expect(screen.getByText('Framework')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByText('Tauri')).toBeInTheDocument();
  });

  it('renders version and stable badge', () => {
    render(<AboutTemplate {...PROPS} />);
    expect(screen.getByText('v0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });
});
