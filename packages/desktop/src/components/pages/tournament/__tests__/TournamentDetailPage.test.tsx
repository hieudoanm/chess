import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TournamentDetailPage } from '@/components/pages/tournament/TournamentDetailPage';
import type { Tournament, Participant, Match, Group } from '@/types';

let mockPathname = '/';
let mockSearchParams: Record<string, string | null> = {};
const mockRouter = { push: jest.fn(), back: jest.fn() };

const tournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: 't1',
  name: 'Cup',
  description: '',
  format: 'single-elimination',
  status: 'draft',
  maxParticipants: 8,
  createdAt: 100,
  updatedAt: 100,
  ...overrides,
});

const participant = (id: string, name?: string): Participant => ({
  id,
  tournamentId: 't1',
  name: name ?? `Player ${id}`,
  seed: 1,
});

const match = (overrides: Partial<Match> = {}): Match => ({
  id: 'm1',
  tournamentId: 't1',
  round: 1,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
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
};

jest.mock('@/providers/DataProvider', () => ({
  useData: () => mockData,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams[key] ?? null,
  }),
  useRouter: () => mockRouter,
}));

beforeEach(() => {
  mockPathname = '/';
  mockSearchParams = { id: 't1' };
  mockData.tournaments = [tournament()];
  mockData.participants = [
    participant('p1', 'Alpha'),
    participant('p2', 'Beta'),
  ];
  mockData.matches = [];
  mockData.groups = [];
  mockData.loading = false;
  mockRouter.push.mockClear();
  mockRouter.back.mockClear();
  Object.values(mockData).forEach((mock) => {
    if (typeof mock === 'function') (mock as jest.Mock).mockClear();
  });
});

describe('TournamentDetailPage', () => {
  it('shows the not-found message without an id', () => {
    mockSearchParams = {};
    render(<TournamentDetailPage />);
    expect(screen.getByText('No tournament selected')).toBeInTheDocument();
  });

  it('shows a loading state when the tournament is missing', () => {
    mockSearchParams = { id: 'nope' };
    mockData.tournaments = [];
    render(<TournamentDetailPage />);
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('renders every tab and switches between them', () => {
    mockData.tournaments = [
      tournament({
        status: 'in-progress',
        description: 'A tournament',
        startDate: 200,
      }),
    ];
    mockData.participants = [
      participant('p1', 'Alpha'),
      participant('p2', 'Beta'),
    ];
    mockData.matches = [
      match({
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({
        id: 'm2',
        round: 2,
        participant1Score: 1,
        participant2Score: 2,
        winnerId: 'p2',
        status: 'completed',
      }),
    ];
    render(<TournamentDetailPage />);

    expect(screen.getByText('A tournament')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Bracket' }));
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Standings' }));
    expect(screen.getByText('🥇')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Matches' }));
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Participants' }));
    expect(screen.getByPlaceholderText('Participant name')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
  });

  it('starts a draft tournament from the overview', async () => {
    mockData.participants = [
      participant('p1', 'Alpha'),
      participant('p2', 'Beta'),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Tournament' }));

    await waitFor(() => expect(mockData.createMatches).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockData.updateTournament).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in-progress' })
      )
    );
  });

  it('shows a hint when a draft has too few participants', () => {
    mockData.participants = [participant('p1', 'Alpha')];
    render(<TournamentDetailPage />);
    expect(
      screen.getByText('Add at least 2 participants to start')
    ).toBeInTheDocument();
  });

  it('deletes a tournament after confirmation', async () => {
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Tournament' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete', hidden: true })
    );
    await waitFor(() =>
      expect(mockData.deleteTournament).toHaveBeenCalledWith('t1')
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('renders standings with medal positions', () => {
    mockData.tournaments = [tournament({ status: 'completed' })];
    mockData.participants = [
      participant('p1', 'Alpha'),
      participant('p2', 'Beta'),
      participant('p3', 'Gamma'),
    ];
    mockData.matches = [
      match({
        id: 'm1',
        participant1Score: 3,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({
        id: 'm2',
        participant1Id: 'p2',
        participant2Id: 'p3',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p2',
        status: 'completed',
      }),
      match({
        id: 'm3',
        participant1Id: 'p1',
        participant2Id: 'p3',
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
        status: 'completed',
      }),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Standings' }));
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.queryByText('#4')).not.toBeInTheDocument();
  });

  it('renders a round-robin bracket with fallbacks', () => {
    mockData.tournaments = [tournament({ format: 'round-robin' })];
    mockData.matches = [
      match({
        id: 'm1',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({ id: 'm2', round: 2, participant2Id: 'ghost' }),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bracket' }));
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.getByText('TBD')).toBeInTheDocument();
    expect(screen.getByText(/^-\s*:\s*-$/)).toBeInTheDocument();
  });

  it('renders a double-elimination bracket', () => {
    mockData.tournaments = [tournament({ format: 'double-elimination' })];
    mockData.matches = [
      match({
        id: 'm1',
        round: 1,
        bracket: 'winners',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({
        id: 'm2',
        round: 1,
        bracket: 'losers',
        participant1Score: 0,
        participant2Score: 2,
        winnerId: 'p2',
        status: 'completed',
      }),
      match({
        id: 'm3',
        round: 2,
        bracket: 'final',
        participant1Score: 3,
        participant2Score: 3,
        winnerId: null,
        status: 'completed',
      }),
      match({ id: 'm4', round: 2, bracket: 'winners', participant2Id: null }),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bracket' }));
    expect(screen.getByText('Winners Bracket')).toBeInTheDocument();
    expect(screen.getByText('Losers Bracket')).toBeInTheDocument();
    expect(screen.getByText('Grand Final')).toBeInTheDocument();
    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('labels a single-round bracket as Round 1', () => {
    mockData.matches = [
      match({
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bracket' }));
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.queryByText('Final')).not.toBeInTheDocument();
  });

  it('renders matches with fallbacks and an add link', () => {
    mockData.matches = [match({ id: 'm1', participant2Id: null })];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Matches' }));
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('TBD')).toBeInTheDocument();
    expect(screen.getByText(/^-\s*:\s*-$/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add Match' })).toHaveAttribute(
      'href',
      '/participants?tournamentId=t1'
    );
  });

  it('adds, batch adds, and removes participants from the tab', async () => {
    mockData.participants = [
      { ...participant('p1', 'Alpha'), rating: 1500 },
      participant('p2', 'Beta'),
    ];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Participants' }));
    expect(screen.getByText('1500')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'Charlie' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() =>
      expect(mockData.createParticipant).toHaveBeenCalledWith({
        tournamentId: 't1',
        name: 'Charlie',
        seed: 3,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Batch Add' }));
    fireEvent.change(screen.getByPlaceholderText('One name per line'), {
      target: { value: 'Dave\nEve' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add All' }));
    await waitFor(() =>
      expect(mockData.createParticipants).toHaveBeenCalledWith([
        { tournamentId: 't1', name: 'Dave', seed: 3 },
        { tournamentId: 't1', name: 'Eve', seed: 4 },
      ])
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    await waitFor(() =>
      expect(mockData.deleteParticipant).toHaveBeenCalledWith('p1')
    );
  });

  it('shows the empty participants state', () => {
    mockData.participants = [];
    render(<TournamentDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Participants' }));
    expect(screen.getByText(/No participants yet/)).toBeInTheDocument();
  });
});
