import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ParticipantsPage } from '@/components/pages/participants/ParticipantsPage';
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

describe('ParticipantsPage', () => {
  it('shows the not-found message without a tournament', () => {
    mockSearchParams = { id: 'nope' };
    mockData.tournaments = [];
    render(<ParticipantsPage />);
    expect(screen.getByText('Tournament not found')).toBeInTheDocument();
  });

  it('adds, batch adds, and removes participants', async () => {
    mockData.participants = [];
    render(<ParticipantsPage />);
    expect(screen.getByText(/No participants yet/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'Charlie' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() =>
      expect(mockData.createParticipant).toHaveBeenCalledWith({
        tournamentId: 't1',
        name: 'Charlie',
        seed: 1,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Batch Add' }));
    fireEvent.change(screen.getByPlaceholderText('One name per line'), {
      target: { value: 'Dave\nEve\n  \nFrank' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add All' }));
    await waitFor(() =>
      expect(mockData.createParticipants).toHaveBeenCalledWith([
        { tournamentId: 't1', name: 'Dave', seed: 1 },
        { tournamentId: 't1', name: 'Eve', seed: 2 },
        { tournamentId: 't1', name: 'Frank', seed: 3 },
      ])
    );

    mockData.participants = [participant('p1', 'Alpha')];
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() =>
      expect(mockData.deleteParticipant).toHaveBeenCalledWith('p1')
    );
  });

  it('disables the add button when the participant limit is reached', () => {
    mockData.tournaments = [tournament({ maxParticipants: 1 })];
    mockData.participants = [participant('p1', 'Alpha')];
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'Beta' },
    });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('auto-seeds participants by rating descending', async () => {
    mockData.participants = [
      { ...participant('p1', 'Alpha'), rating: 1500 },
      { ...participant('p2', 'Beta'), rating: 1200 },
      { ...participant('p3', 'Gamma'), rating: 1800 },
    ];
    render(<ParticipantsPage />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Auto-seed by Rating' })
    );
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledWith({
        id: 'p3',
        tournamentId: 't1',
        name: 'Gamma',
        seed: 1,
        rating: 1800,
      })
    );
    expect(mockData.updateParticipant).toHaveBeenCalledWith({
      id: 'p1',
      tournamentId: 't1',
      name: 'Alpha',
      seed: 2,
      rating: 1500,
    });
    expect(mockData.updateParticipant).toHaveBeenCalledWith({
      id: 'p2',
      tournamentId: 't1',
      name: 'Beta',
      seed: 3,
      rating: 1200,
    });
  });

  it('randomizes seeds', async () => {
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Randomize Seeds' }));
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledTimes(2)
    );
  });

  it('updates a seed from its input', async () => {
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByLabelText('Seed for Alpha'), {
      target: { value: '5' },
    });
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledWith({
        id: 'p1',
        tournamentId: 't1',
        name: 'Alpha',
        seed: 5,
      })
    );
  });

  it('updates a rating from its input', async () => {
    mockData.participants = [{ ...participant('p1', 'Alpha'), rating: 1500 }];
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByLabelText('Rating for Alpha'), {
      target: { value: '1700' },
    });
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 1700 })
      )
    );
  });

  it('assigns a participant to a group', async () => {
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.groups = [
      { id: 'gA', tournamentId: 't1', name: 'Group A', participantIds: [] },
    ];
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByLabelText('Group for Alpha'), {
      target: { value: 'gA' },
    });
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledWith({
        id: 'p1',
        tournamentId: 't1',
        name: 'Alpha',
        seed: 1,
        groupId: 'gA',
      })
    );
  });

  it('creates groups and auto-assigns participants', async () => {
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.createGroup.mockImplementation(async (g: Group) => ({
      ...g,
      id: g.name === 'Group A' ? 'gA' : 'gB',
    }));
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Auto-assign Groups' }));
    await waitFor(() => expect(mockData.createGroup).toHaveBeenCalledTimes(2));
    expect(mockData.createGroup).toHaveBeenCalledWith({
      tournamentId: 't1',
      name: 'Group A',
      participantIds: [],
    });
    await waitFor(() =>
      expect(mockData.updateParticipant).toHaveBeenCalledWith({
        id: 'p1',
        tournamentId: 't1',
        name: 'Alpha',
        seed: 1,
        groupId: 'gA',
      })
    );
    expect(mockData.updateParticipant).toHaveBeenCalledWith({
      id: 'p2',
      tournamentId: 't1',
      name: 'Beta',
      seed: 1,
      groupId: 'gB',
    });
  });

  it('does not batch add when there are no names', async () => {
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Batch Add' }));
    fireEvent.change(screen.getByPlaceholderText('One name per line'), {
      target: { value: '   \n\n' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add All' }));
    await waitFor(() =>
      expect(mockData.createParticipants).not.toHaveBeenCalled()
    );
  });

  it('assigns into existing groups without creating new ones', async () => {
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.groups = [
      { id: 'gA', tournamentId: 't1', name: 'Group A', participantIds: [] },
      { id: 'gB', tournamentId: 't1', name: 'Group B', participantIds: [] },
    ];
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Auto-assign Groups' }));
    await waitFor(() => expect(mockData.createGroup).not.toHaveBeenCalled());
    expect(mockData.updateParticipant).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', groupId: 'gA' })
    );
    expect(mockData.updateParticipant).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p2', groupId: 'gB' })
    );
  });

  it('imports participants from a CSV file', async () => {
    mockData.participants = [];
    mockedReadFileAsText.mockResolvedValue('name,seed,rating\n');
    mockedImportParticipantsFromCSV.mockReturnValue([
      { name: 'Ivy', seed: 3, rating: 1000 },
      { name: 'Jay' },
    ]);
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByLabelText('Import participants CSV'), {
      target: { files: [new File([''], 'p.csv', { type: 'text/csv' })] },
    });
    await waitFor(() =>
      expect(mockData.createParticipants).toHaveBeenCalledWith([
        { tournamentId: 't1', name: 'Ivy', seed: 3, rating: 1000 },
        { tournamentId: 't1', name: 'Jay', seed: 2, rating: undefined },
      ])
    );
  });

  it('does not import an empty CSV', async () => {
    mockedReadFileAsText.mockResolvedValue('');
    mockedImportParticipantsFromCSV.mockReturnValue([]);
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    fireEvent.change(screen.getByLabelText('Import participants CSV'), {
      target: { files: [new File([''], 'p.csv', { type: 'text/csv' })] },
    });
    await waitFor(() =>
      expect(mockData.createParticipants).not.toHaveBeenCalled()
    );
  });

  it('cancels the batch add form', async () => {
    render(<ParticipantsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Batch Add' }));
    fireEvent.change(screen.getByPlaceholderText('One name per line'), {
      target: { value: 'Dave' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.queryByPlaceholderText('One name per line')
    ).not.toBeInTheDocument();
  });

  it('updates the number of groups for auto-assignment', async () => {
    mockData.tournaments = [tournament({ format: 'group-stage' })];
    mockData.createGroup.mockImplementation(async (g: Group) => ({
      ...g,
      id: `g-${g.name}`,
    }));
    render(<ParticipantsPage />);
    fireEvent.change(screen.getByLabelText('Number of groups'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Auto-assign Groups' }));
    await waitFor(() => expect(mockData.createGroup).toHaveBeenCalledTimes(3));
  });

  it('opens a profile modal with stats and recent matches', () => {
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
    render(<ParticipantsPage />);
    fireEvent.click(
      screen.getByRole('button', { name: 'View profile for Alpha' })
    );
    expect(screen.getByText('Seed: 1')).toBeInTheDocument();
    expect(screen.getByText('Played')).toBeInTheDocument();
    expect(screen.getByText('Won')).toBeInTheDocument();
    expect(screen.getByText('vs Beta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Played')).not.toBeInTheDocument();
  });
});
