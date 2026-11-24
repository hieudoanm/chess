import { fireEvent, render, screen } from '@testing-library/react';
import { StandingsPage } from '@/components/pages/standings/StandingsPage';
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

const participant = (id: string, name?: string): Participant => ({
  id,
  tournamentId: 't1',
  name: name ?? `Player ${id}`,
  seed: 1,
});

const completed = (
  id: string,
  p1: string,
  p2: string,
  s1: number,
  s2: number,
  winner: string | null
): Match => ({
  id,
  tournamentId: 't1',
  round: 1,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: s1,
  participant2Score: s2,
  winnerId: winner,
  status: 'completed',
});

let mockPathname = '/';
let mockSearchParams: Record<string, string | null> = {};

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
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams[key] ?? null,
  }),
}));

describe('StandingsPage', () => {
  beforeEach(() => {
    mockSearchParams = { id: 't1' };
    mockData.tournaments = [
      tournament({ id: 't1', name: 'Cup', status: 'completed' }),
    ];
    mockData.participants = ['a', 'b', 'c', 'd'].map((id) =>
      participant(id, `Team ${id}`)
    );
    mockData.matches = [
      completed('m1', 'a', 'b', 2, 0, 'a'),
      completed('m2', 'c', 'd', 1, 0, 'c'),
      completed('m3', 'a', 'c', 1, 1, 'a'),
    ];
  });

  it('shows the not-found message when the tournament is missing', () => {
    mockSearchParams = { id: 'nope' };
    mockData.tournaments = [];
    render(<StandingsPage />);
    expect(screen.getByText('Tournament not found')).toBeInTheDocument();
  });

  it('shows the not-found message without an id', () => {
    mockSearchParams = {};
    render(<StandingsPage />);
    expect(screen.getByText('Tournament not found')).toBeInTheDocument();
  });

  it('renders standings with medal positions and names', () => {
    render(<StandingsPage />);
    expect(screen.getByText('Team a')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
    expect(
      screen.queryByText(/No standings available/)
    ).not.toBeInTheDocument();
  });

  it('shows the empty standings message when there are no participants', () => {
    mockData.participants = [];
    mockData.matches = [];
    render(<StandingsPage />);
    expect(screen.getByText(/No standings available yet/)).toBeInTheDocument();
  });

  it('captures a snapshot with a default label when blank', async () => {
    render(<StandingsPage />);
    fireEvent.click(screen.getByText('Capture Snapshot'));
    expect(mockData.createSnapshot).toHaveBeenCalledWith(
      't1',
      'Standings snapshot',
      expect.any(Array)
    );
  });

  it('captures a snapshot using the typed label', async () => {
    render(<StandingsPage />);
    fireEvent.change(screen.getByPlaceholderText('Snapshot label (optional)'), {
      target: { value: 'Week 1' },
    });
    fireEvent.click(screen.getByText('Capture Snapshot'));
    expect(mockData.createSnapshot).toHaveBeenCalledWith(
      't1',
      'Week 1',
      expect.any(Array)
    );
  });

  it('selects and deselects a snapshot', () => {
    mockData.snapshots = [
      {
        id: 's1',
        tournamentId: 't1',
        label: 'Week 1',
        createdAt: 100,
        standings: [
          {
            participantId: 'a',
            tournamentId: 't1',
            position: 1,
            played: 2,
            won: 2,
            drawn: 0,
            lost: 0,
            points: 6,
          },
        ],
      },
    ];
    render(<StandingsPage />);
    fireEvent.click(screen.getByText('Week 1'));
    expect(screen.getByText('← Back to live standings')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Week 1'));
    expect(
      screen.queryByText('← Back to live standings')
    ).not.toBeInTheDocument();
  });

  it('clears the selection when the selected snapshot is deleted', () => {
    mockData.snapshots = [
      {
        id: 's1',
        tournamentId: 't1',
        label: 'Week 1',
        createdAt: 100,
        standings: [
          {
            participantId: 'a',
            tournamentId: 't1',
            position: 1,
            played: 2,
            won: 2,
            drawn: 0,
            lost: 0,
            points: 6,
          },
        ],
      },
    ];
    render(<StandingsPage />);
    fireEvent.click(screen.getByText('Week 1'));
    expect(screen.getByText('← Back to live standings')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    expect(mockData.deleteSnapshot).toHaveBeenCalledWith('s1');
    expect(
      screen.queryByText('← Back to live standings')
    ).not.toBeInTheDocument();
  });
});
