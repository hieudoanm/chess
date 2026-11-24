import { render, screen } from '@testing-library/react';
import { buildVersion } from '@/content/version';
import VersionPage from '@/app/(info)/version/page';

describe('VersionPage', () => {
  it('renders the build-time version', () => {
    render(<VersionPage />);
    expect(screen.getByText(buildVersion)).toBeInTheDocument();
    expect(screen.getByText('Copy version')).toBeInTheDocument();
  });
});
