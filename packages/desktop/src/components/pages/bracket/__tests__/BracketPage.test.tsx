import { render, screen } from '@testing-library/react';
import { BracketPage } from '@/components/pages/bracket/BracketPage';
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

describe('BracketPage', () => {
  it('shows the not-found message without a tournament', () => {
    mockSearchParams = { id: 'nope' };
    mockData.tournaments = [];
    render(<BracketPage />);
    expect(screen.getByText('Tournament not found')).toBeInTheDocument();
  });

  it('renders an elimination bracket with round labels and winners', () => {
    mockData.tournaments = [tournament({ status: 'completed' })];
    mockData.matches = [
      match({
        id: 'm1',
        round: 1,
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      }),
      match({
        id: 'm2',
        round: 2,
        participant1Score: 1,
        participant2Score: 3,
        winnerId: 'p2',
        status: 'completed',
      }),
      match({
        id: 'm3',
        round: 1,
        participant1Id: 'p2',
        participant2Id: null,
        participant1Score: 0,
        participant2Score: 0,
        winnerId: null,
      }),
      match({
        id: 'm4',
        round: 1,
        participant1Id: 'ghost',
        participant2Id: 'p1',
        participant1Score: 0,
        participant2Score: 0,
        winnerId: null,
      }),
    ];
    render(<BracketPage />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getByText('BYE')).toBeInTheDocument();
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('renders a group-stage bracket', () => {
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.matches = [
      match({ participant1Score: 2, participant2Score: 1, winnerId: 'p1' }),
    ];
    render(<BracketPage />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('labels a semi-final round', () => {
    mockData.matches = [
      match({ id: 'm1', round: 1 }),
      match({ id: 'm2', round: 2 }),
      match({ id: 'm3', round: 3 }),
    ];
    render(<BracketPage />);
    expect(screen.getByText('Semi-Final')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });
});
