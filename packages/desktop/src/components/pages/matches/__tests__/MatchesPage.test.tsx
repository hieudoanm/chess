import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MatchesPage } from '@/components/pages/matches/MatchesPage';
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

describe('MatchesPage', () => {
  it('shows the not-found message without a tournament', () => {
    mockSearchParams = { id: 'nope' };
    mockData.tournaments = [];
    render(<MatchesPage />);
    expect(screen.getByText('Tournament not found')).toBeInTheDocument();
  });

  it('renders matches grouped by round and adds a match', async () => {
    mockData.matches = [
      match({
        id: 'm1',
        participant1Score: 2,
        participant2Score: 1,
        status: 'completed',
      }),
      match({ id: 'm2', round: 2 }),
    ];
    render(<MatchesPage />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getByText('2 : 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Match' }));
    await waitFor(() =>
      expect(mockData.createMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          tournamentId: 't1',
          round: 3,
          status: 'scheduled',
        })
      )
    );
  });

  it('shows the empty state when there are no matches', () => {
    mockData.matches = [];
    render(<MatchesPage />);
    expect(screen.getByText(/No matches yet/)).toBeInTheDocument();
  });

  it('starts a new tournament at round one', async () => {
    mockData.matches = [];
    render(<MatchesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Match' }));
    await waitFor(() =>
      expect(mockData.createMatch).toHaveBeenCalledWith(
        expect.objectContaining({ round: 1 })
      )
    );
  });

  it('toggles to the calendar view and labels unknown participants as TBD', () => {
    mockData.matches = [
      match({ id: 'm1', participant1Id: 'ghost', participant2Id: 'p2' }),
      match({ id: 'm2', participant1Id: null, participant2Id: null }),
    ];
    const { container } = render(<MatchesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(screen.getByText('Unscheduled (2)')).toBeInTheDocument();
    expect(screen.getAllByText(/TBD/).length).toBeGreaterThan(0);
    expect(container.querySelector('button.btn-active')).toHaveTextContent(
      'Calendar'
    );
  });
});
