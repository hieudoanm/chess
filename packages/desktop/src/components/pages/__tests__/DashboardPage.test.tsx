import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardPage } from '@/components/pages/DashboardPage';
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

describe('DashboardPage', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockData.tournaments = [
      tournament({ id: 't1', name: 'Alpha Cup', status: 'draft' }),
      tournament({ id: 't2', name: 'Beta Cup', status: 'completed' }),
    ];
    mockData.participants = [participant('p1')];
    mockData.loading = false;
  });

  it('renders tournaments and filters by search and status', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Alpha Cup')).toBeInTheDocument();
    expect(screen.getByText('Beta Cup')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search tournaments...'), {
      target: { value: 'beta' },
    });
    expect(screen.queryByText('Alpha Cup')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Cup')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search tournaments...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.queryByText('Alpha Cup')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Cup')).toBeInTheDocument();
  });

  it('highlights the create nav item on its route', () => {
    mockPathname = '/create';
    render(<DashboardPage />);
    const create = document.querySelector('a[href="/create"]');
    expect(create?.className).toContain('btn-primary');
    const home = document.querySelector('a[href="/"]');
    expect(home?.className).toContain('btn-ghost');
  });

  it('counts participants per tournament', () => {
    render(<DashboardPage />);
    expect(screen.getByText('1/8')).toBeInTheDocument();
  });
});
