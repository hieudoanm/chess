import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CreatePage } from '@/components/pages/create/CreatePage';
import type { Tournament, Participant, Match, Group } from '@/types';

let mockPathname = '/';
let mockSearchParams: Record<string, string | null> = {};
const mockRouter = { push: jest.fn(), back: jest.fn() };

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

describe('CreatePage', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockData.createTournament.mockClear();
  });

  it('creates a tournament with the selected options', async () => {
    const { container } = render(<CreatePage />);
    fireEvent.change(screen.getByPlaceholderText('Tournament name'), {
      target: { value: 'Summer Cup' },
    });
    fireEvent.change(screen.getByPlaceholderText('Optional description'), {
      target: { value: 'Big event' },
    });
    fireEvent.click(screen.getByText('Double Elimination'));
    fireEvent.click(screen.getByRole('button', { name: '32' }));
    const dateInput = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(dateInput, {
      target: { value: '2025-06-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockData.createTournament).toHaveBeenCalledWith({
        name: 'Summer Cup',
        description: 'Big event',
        format: 'double-elimination',
        status: 'draft',
        maxParticipants: 32,
        startDate: new Date('2025-06-01').getTime(),
        bestOf: 1,
        scoringRule: 'standard',
        thirdPlacePlayoff: false,
        tiebreakers: ['points', 'wins', 'goal-difference', 'head-to-head'],
      })
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('creates a tournament without a start date', async () => {
    render(<CreatePage />);
    fireEvent.change(screen.getByPlaceholderText('Tournament name'), {
      target: { value: 'Quick Cup' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockData.createTournament).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: undefined })
      )
    );
  });

  it('disables the submit button when the name is blank', () => {
    render(<CreatePage />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('goes back when cancelled', () => {
    render(<CreatePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('falls back to defaults when using a template missing optional fields', async () => {
    window.localStorage.setItem(
      'tourney-templates',
      JSON.stringify([
        {
          id: 'tpl-1',
          name: 'Minimal',
          description: '',
          format: 'round-robin',
          maxParticipants: 8,
        },
      ])
    );
    render(<CreatePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Use' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockData.createTournament).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Minimal',
          format: 'round-robin',
          maxParticipants: 8,
          bestOf: 1,
          scoringRule: 'standard',
          thirdPlacePlayoff: false,
          tiebreakers: ['points', 'wins', 'goal-difference', 'head-to-head'],
        })
      )
    );
  });
});
