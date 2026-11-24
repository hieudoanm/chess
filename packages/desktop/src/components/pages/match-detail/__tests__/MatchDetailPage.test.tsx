import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MatchDetailPage } from '@/components/pages/match-detail/MatchDetailPage';
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

describe('MatchDetailPage', () => {
  it('shows the not-found message without a match', () => {
    mockSearchParams = { id: 'nope' };
    render(<MatchDetailPage />);
    expect(screen.getByText('Match not found')).toBeInTheDocument();
  });

  it('renders participants, saves scores, and sets a winner', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.matches = [
      match({ participant1Score: 0, participant2Score: 0, winnerId: null }),
    ];
    render(<MatchDetailPage />);
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          participant1Score: 3,
          participant2Score: 1,
          status: 'completed',
        })
      )
    );

    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({ winnerId: 'p1', status: 'completed' })
      )
    );
  });

  it('saves a null score when left blank', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.matches = [match()];
    render(<MatchDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          participant1Score: null,
          participant2Score: null,
        })
      )
    );
  });

  it('hides the winner selector for matches with one participant', () => {
    mockSearchParams = { id: 'm1' };
    mockData.matches = [match({ participant2Id: null })];
    render(<MatchDetailPage />);
    expect(screen.queryByText('Set Winner')).not.toBeInTheDocument();
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('saves sets with parsed scores and propagates to later rounds', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.tournaments = [tournament({ bestOf: 3 })];
    mockData.matches = [
      match({ id: 'm1' }),
      match({
        id: 'm2',
        round: 2,
        participant1Id: 'm1',
        participant2Id: null,
      }),
    ];
    render(<MatchDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Set' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Set' }));
    fireEvent.change(screen.getByLabelText('Set 1 player 1 score'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Set 1 player 2 score'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Set 2 player 2 score'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          winnerId: 'p1',
          sets: [
            { p1Score: 3, p2Score: 1 },
            { p1Score: 0, p2Score: 0 },
          ],
        })
      )
    );
    expect(mockData.updateMatch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm2', participant1Id: 'p1' })
    );
  });

  it('clears sets when saving without set rows', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.tournaments = [tournament({ bestOf: 3 })];
    mockData.matches = [match()];
    render(<MatchDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({ sets: undefined })
      )
    );
  });

  it('saves penalty shootout scores with a standard score entry', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.tournaments = [tournament({ scoringRule: 'penalty-shootout' })];
    mockData.matches = [match()];
    render(<MatchDetailPage />);
    fireEvent.change(screen.getByLabelText('Penalty player 1 score'), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText('Penalty player 2 score'), {
      target: { value: '3' },
    });
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          penaltyScore1: 4,
          penaltyScore2: 3,
          participant1Score: 1,
          participant2Score: 0,
        })
      )
    );
  });

  it('saves penalty shootout scores alongside sets', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.tournaments = [
      tournament({ bestOf: 3, scoringRule: 'penalty-shootout' }),
    ];
    mockData.matches = [match()];
    render(<MatchDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Set' }));
    fireEvent.change(screen.getByLabelText('Set 1 player 1 score'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('Set 1 player 2 score'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Penalty player 1 score'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText('Penalty player 2 score'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          penaltyScore1: 5,
          penaltyScore2: 4,
          sets: [{ p1Score: 2, p2Score: 1 }],
        })
      )
    );
  });

  it('labels unknown participants as TBD and Player fallbacks', () => {
    mockSearchParams = { id: 'm1' };
    mockData.matches = [
      match({ participant1Id: 'ghost', participant2Id: 'p2' }),
    ];
    render(<MatchDetailPage />);
    expect(screen.getByText('TBD')).toBeInTheDocument();
    expect(screen.getAllByText('Player 1').length).toBeGreaterThan(0);
  });

  it('advances knockout slots from group standings', async () => {
    mockSearchParams = { id: 'm1' };
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.groups = [
      {
        id: 'g1',
        tournamentId: 't1',
        name: 'Group A',
        participantIds: ['p1', 'p2'],
      },
    ];
    mockData.participants = [
      { ...participant('p1', 'Alpha'), groupId: 'g1' },
      { ...participant('p2', 'Beta'), groupId: 'g1' },
    ];
    mockData.matches = [
      match({
        id: 'm1',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({
        id: 'm2',
        round: 2,
        bracket: 'final',
        participant1Id: null,
        participant2Id: null,
      }),
    ];
    render(<MatchDetailPage />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockData.updateMatch).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'm2', participant1Id: 'p1' })
      )
    );
  });
});
