import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProfilePage } from '@/components/pages/profile/ProfilePage';
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

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams[key] ?? null,
  }),
  useRouter: () => mockRouter,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    mockData.tournaments = [
      tournament({ id: 't1', name: 'Draft Cup', status: 'draft' }),
      tournament({
        id: 't2',
        name: 'Done Cup',
        status: 'completed',
        createdAt: 200,
        updatedAt: 300,
      }),
    ];
    mockData.participants = [
      participant('p1', 'Alpha'),
      participant('p2', 'Beta'),
    ];
    mockData.matches = [
      {
        id: 'm1',
        tournamentId: 't1',
        round: 1,
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
      },
    ];
  });

  it('renders stats and recent activity', () => {
    render(<ProfilePage />);
    expect(screen.getAllByText('2')).toHaveLength(1);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('"Done Cup" completed')).toBeInTheDocument();
    expect(screen.getByText('Created "Done Cup"')).toBeInTheDocument();
    expect(screen.getByText('Alpha won vs Beta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
    expect(screen.getByRole('link', { name: 'Version' })).toHaveAttribute(
      'href',
      '/version'
    );
  });

  it('shows a dash win rate and empty activity without completed matches', () => {
    mockData.matches = [];
    mockData.tournaments = [];
    render(<ProfilePage />);
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });
});
