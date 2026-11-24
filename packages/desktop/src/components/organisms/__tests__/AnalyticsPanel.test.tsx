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

import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider } from '@/providers/DataProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ToastContainer } from '@/components/organisms/ToastContainer';
import { db } from '@/lib/db';
import { AnalyticsPanel } from '@/components/organisms/AnalyticsPanel';
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

describe('AnalyticsPanel', () => {
  it('shows a fallback when there is no analytics', async () => {
    (db.getAllTournaments as jest.Mock).mockResolvedValue([]);
    render(<AnalyticsPanel tournamentId="missing" />, { wrapper: wrappers });
    await waitFor(() =>
      expect(screen.getByText('No analytics available')).toBeInTheDocument()
    );
  });

  it('renders stats for an in-progress tournament', async () => {
    const completed = {
      id: 'm1',
      tournamentId: 't1',
      round: 1,
      participant1Id: 'p1',
      participant2Id: 'p2',
      participant1Score: 2,
      participant2Score: 1,
      winnerId: 'p1',
      status: 'completed',
    };
    const scheduled = { ...completed, id: 'm2', status: 'scheduled' };
    (db.getParticipants as jest.Mock).mockResolvedValue([
      { id: 'p1', tournamentId: 't1', name: 'Alpha', seed: 1 },
      { id: 'p2', tournamentId: 't1', name: 'Beta', seed: 2 },
    ]);
    (db.getMatches as jest.Mock).mockResolvedValue([completed, scheduled]);

    render(<AnalyticsPanel tournamentId="t1" />, { wrapper: wrappers });
    await waitFor(() =>
      expect(screen.getByText('Total Matches')).toBeInTheDocument()
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Predicted Standings')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
  });

  it('renders highlights and closest matches with fallback names', async () => {
    (db.getParticipants as jest.Mock).mockResolvedValue([
      { id: 'p1', tournamentId: 't1', name: 'Alpha', seed: 1 },
    ]);
    (db.getMatches as jest.Mock).mockResolvedValue([
      {
        id: 'm1',
        tournamentId: 't1',
        round: 1,
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: 1,
        participant2Score: 2,
        winnerId: 'p2',
        status: 'completed',
      },
      {
        id: 'm2',
        tournamentId: 't1',
        round: 2,
        participant1Id: undefined,
        participant2Id: 'p2',
        participant1Score: 3,
        participant2Score: 1,
        winnerId: 'p2',
        status: 'completed',
      },
      {
        id: 'm3',
        tournamentId: 't1',
        round: 3,
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      },
    ]);

    render(<AnalyticsPanel tournamentId="t1" />, { wrapper: wrappers });
    await waitFor(() =>
      expect(screen.getByText('Top Scorer')).toBeInTheDocument()
    );
    expect(screen.getAllByText(/Unknown/).length).toBeGreaterThan(0);
    expect(screen.getByText('Closest Matches')).toBeInTheDocument();
    expect(screen.getByText(/TBD vs/)).toBeInTheDocument();
  });
});
