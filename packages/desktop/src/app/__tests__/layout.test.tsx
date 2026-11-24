import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import RootLayout from '@/app/layout';
import type { Tournament, Participant, Match, Group } from '@/types';

let mockPathname = '/';
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
    get: () => null,
  }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

describe('RootLayout', () => {
  it('renders the root layout', () => {
    render(
      <RootLayout>
        <span>child</span>
      </RootLayout>
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
