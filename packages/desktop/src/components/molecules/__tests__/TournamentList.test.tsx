import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TournamentList } from '@/components/molecules/TournamentList';
import type { Tournament, Participant, Match, Group } from '@/types';

const tournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: 't1',
  name: 'Cup',
  description: '',
  format: 'single-elimination',
  status: 'draft',
  maxParticipants: 8,
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

const mockData = {
  tournaments: [] as Tournament[],
  participants: [] as Participant[],
  matches: [] as Match[],
  groups: [] as Group[],
  loading: false,
  refresh: jest.fn(),
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
  snapshots: [] as import('@/types').StandingSnapshot[],
  createSnapshot: jest.fn(),
  deleteSnapshot: jest.fn(),
  cloneTournament: jest.fn(),
};

jest.mock('@/providers/DataProvider', () => ({
  useData: () => mockData,
  DataProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('TournamentList', () => {
  it('falls back to zero for missing participant counts', () => {
    mockData.tournaments = [tournament()];
    mockData.participants = [];
    render(
      <TournamentList
        loading={false}
        tournaments={mockData.tournaments}
        participantCounts={{}}
      />
    );
    expect(screen.getByText('0/8')).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    render(<TournamentList loading tournaments={[]} participantCounts={{}} />);
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tournaments', () => {
    render(
      <TournamentList loading={false} tournaments={[]} participantCounts={{}} />
    );
    expect(screen.getByText('No tournaments yet')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create Tournament' })
    ).toBeInTheDocument();
  });
});
