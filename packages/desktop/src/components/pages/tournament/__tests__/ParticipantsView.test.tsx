import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ParticipantsView } from '@/components/pages/tournament/ParticipantsView';
import type { Tournament, Participant, Match, Group } from '@/types';

jest.mock('@/lib/import', () => ({
  importParticipantsFromCSV: jest.fn(),
  readFileAsText: jest.fn(),
}));

import { importParticipantsFromCSV, readFileAsText } from '@/lib/import';

const mockedImportParticipantsFromCSV =
  importParticipantsFromCSV as jest.MockedFunction<
    typeof importParticipantsFromCSV
  >;
const mockedReadFileAsText = readFileAsText as jest.MockedFunction<
  typeof readFileAsText
>;

let mockPathname = '/';
let mockSearchParams: Record<string, string | null> = {};

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
  Object.values(mockData).forEach((mock) => {
    if (typeof mock === 'function') (mock as jest.Mock).mockClear();
  });
});

describe('ParticipantsView', () => {
  it('adds a participant when pressing Enter', async () => {
    render(
      <ParticipantsView
        tournament={mockData.tournaments[0]}
        participants={mockData.participants}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'Charlie' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Participant name'), {
      key: 'Enter',
    });
    await waitFor(() =>
      expect(mockData.createParticipant).toHaveBeenCalledWith({
        tournamentId: 't1',
        name: 'Charlie',
        seed: 3,
      })
    );
  });

  it('imports participants from a CSV file', async () => {
    mockedReadFileAsText.mockResolvedValue('name,seed\n');
    mockedImportParticipantsFromCSV.mockReturnValue([
      { name: 'Ivy', seed: 7, rating: 1000 },
    ]);
    render(
      <ParticipantsView
        tournament={mockData.tournaments[0]}
        participants={mockData.participants}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    fireEvent.change(screen.getByLabelText('Import participants CSV'), {
      target: { files: [new File([''], 'p.csv', { type: 'text/csv' })] },
    });
    await waitFor(() =>
      expect(mockData.createParticipants).toHaveBeenCalledWith([
        {
          tournamentId: 't1',
          name: 'Ivy',
          seed: 7,
          rating: 1000,
        },
      ])
    );
  });

  it('does nothing when a CSV file change has no file', async () => {
    render(
      <ParticipantsView
        tournament={mockData.tournaments[0]}
        participants={mockData.participants}
      />
    );
    fireEvent.change(screen.getByLabelText('Import participants CSV'), {
      target: { files: [] },
    });
    await waitFor(() =>
      expect(mockData.createParticipants).not.toHaveBeenCalled()
    );
  });
});
