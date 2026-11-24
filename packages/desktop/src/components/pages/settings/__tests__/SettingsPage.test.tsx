import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsPage } from '@/components/pages/settings/SettingsPage';
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

describe('SettingsPage', () => {
  it('renders all sections and updates selections', () => {
    render(<SettingsPage />);
    expect(screen.getAllByText('Language')).toHaveLength(2);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Tournament Defaults')).toBeInTheDocument();
    expect(screen.getByText('Auto-save')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('English'), {
      target: { value: 'vi' },
    });
    fireEvent.change(screen.getByDisplayValue('Nothing'), {
      target: { value: 'night' },
    });
    fireEvent.change(screen.getByDisplayValue('24-hour'), {
      target: { value: '12h' },
    });
    fireEvent.change(screen.getByDisplayValue('Single Elimination'), {
      target: { value: 'league' },
    });
    fireEvent.change(screen.getByDisplayValue('16'), {
      target: { value: '64' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    expect(screen.getByDisplayValue('Tieng Viet')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Night')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12-hour (AM/PM)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('League')).toBeInTheDocument();
    expect(screen.getByDisplayValue('64')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});
