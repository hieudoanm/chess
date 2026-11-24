jest.mock('@/lib/db', () => ({
  db: {
    getAllTournaments: jest.fn(),
    getParticipants: jest.fn(),
    getMatches: jest.fn(),
    getGroups: jest.fn(),
    createTournament: jest.fn(),
    updateTournament: jest.fn(),
    deleteTournament: jest.fn(),
    createParticipant: jest.fn(),
    createParticipants: jest.fn(),
    updateParticipant: jest.fn(),
    deleteParticipant: jest.fn(),
    createMatch: jest.fn(),
    createMatches: jest.fn(),
    updateMatch: jest.fn(),
    deleteMatch: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getSnapshots: jest.fn(),
  },
}));

jest.mock('@/lib/sharing', () => ({
  generateShareableJSON: jest.fn(() => '{"json":true}'),
  generateTextSummary: jest.fn(() => 'Cup summary'),
  copyToClipboard: jest.fn(),
  shareTournament: jest.fn(),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider } from '@/providers/DataProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ToastContainer } from '@/components/organisms/ToastContainer';
import { db } from '@/lib/db';
import { ShareModal } from '@/components/organisms/ShareModal';
import { copyToClipboard, shareTournament } from '@/lib/sharing';
import type { Tournament } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: '',
  format: 'single-elimination',
  status: 'in-progress',
  maxParticipants: 8,
  createdAt: 1,
  updatedAt: 1,
};

const wrappers = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <DataProvider>{children}</DataProvider>
    <ToastContainer />
  </ToastProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament]);
  (db.getParticipants as jest.Mock).mockResolvedValue([]);
  (db.getMatches as jest.Mock).mockResolvedValue([]);
  (db.getGroups as jest.Mock).mockResolvedValue([]);
  (db.getSnapshots as jest.Mock).mockResolvedValue([]);
});

describe('ShareModal', () => {
  it('renders nothing when closed', () => {
    render(
      <ShareModal isOpen={false} onClose={jest.fn()} tournamentId="t1" />,
      { wrapper: wrappers }
    );
    expect(screen.queryByText('Share Tournament')).not.toBeInTheDocument();
  });

  it('renders the JSON tab and copies on success', async () => {
    (copyToClipboard as jest.Mock).mockResolvedValue(true);
    const onClose = jest.fn();
    render(<ShareModal isOpen onClose={onClose} tournamentId="t1" />, {
      wrapper: wrappers,
    });
    expect(screen.getByText('Share Tournament')).toBeInTheDocument();
    await screen.findByText('Cup');
    fireEvent.click(screen.getByText('Copy to Clipboard'));
    await waitFor(() =>
      expect(copyToClipboard).toHaveBeenCalledWith('{"json":true}')
    );
  });

  it('switches to the text summary tab', async () => {
    render(<ShareModal isOpen onClose={jest.fn()} tournamentId="t1" />, {
      wrapper: wrappers,
    });
    await screen.findByText('Cup');
    fireEvent.click(screen.getByText('Text Summary'));
    expect(screen.getByText('Cup summary')).toBeInTheDocument();
  });

  it('shows an error toast when copying fails', async () => {
    (copyToClipboard as jest.Mock).mockResolvedValue(false);
    render(<ShareModal isOpen onClose={jest.fn()} tournamentId="t1" />, {
      wrapper: wrappers,
    });
    await screen.findByText('Cup');
    fireEvent.click(screen.getByText('Copy to Clipboard'));
    await waitFor(() =>
      expect(screen.getByText('Failed to copy')).toBeInTheDocument()
    );
  });

  it('uses the native share button and reports cancellation', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: jest.fn(),
    });
    (shareTournament as jest.Mock).mockResolvedValue(false);
    render(<ShareModal isOpen onClose={jest.fn()} tournamentId="t1" />, {
      wrapper: wrappers,
    });
    await screen.findByText('Cup');
    fireEvent.click(screen.getByText('Share'));
    await waitFor(() =>
      expect(screen.getByText('Share cancelled')).toBeInTheDocument()
    );
  });

  it('closes when clicking the backdrop', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ShareModal isOpen onClose={onClose} tournamentId="t1" />,
      { wrapper: wrappers }
    );
    fireEvent.click(container.querySelector('.modal-backdrop')!);
    expect(onClose).toHaveBeenCalled();
  });
});
