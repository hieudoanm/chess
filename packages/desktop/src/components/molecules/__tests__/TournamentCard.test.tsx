jest.mock('@/lib/db', () => ({
  db: {
    getAllTournaments: jest.fn(),
    getParticipants: jest.fn(),
    getMatches: jest.fn(),
    getGroups: jest.fn(),
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
    getSnapshots: jest.fn(),
  },
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from '@/providers/DataProvider';
import { db } from '@/lib/db';
import { TournamentCard } from '@/components/molecules/TournamentCard';
import type { Tournament, Participant, Match, Group } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: 'desc',
  format: 'single-elimination',
  status: 'draft',
  maxParticipants: 8,
  createdAt: 1,
  updatedAt: 1,
};

const participant = (id: string): Participant => ({
  id,
  tournamentId: 't1',
  name: `Player ${id}`,
  seed: 1,
});

const match = (id: string): Match => ({
  id,
  tournamentId: 't1',
  round: 1,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
});

const group = (id: string): Group => ({
  id,
  tournamentId: 't1',
  name: 'Group A',
  participantIds: ['p1'],
});

const seed = (overrides: { p?: unknown; m?: unknown; g?: unknown } = {}) => {
  (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament]);
  (db.getParticipants as jest.Mock).mockResolvedValue(
    overrides.p ?? [participant('p1')]
  );
  (db.getMatches as jest.Mock).mockResolvedValue(overrides.m ?? [match('m1')]);
  (db.getGroups as jest.Mock).mockResolvedValue(overrides.g ?? [group('g1')]);
  (db.getSnapshots as jest.Mock).mockResolvedValue([]);
};

describe('TournamentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    seed();
  });

  it('renders name, counts, and badges', async () => {
    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={2} />
      </DataProvider>
    );
    expect(screen.getByText('Cup')).toBeInTheDocument();
    expect(screen.getByText('2/8')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
  });

  it('clones a tournament with its participants, matches, and groups', async () => {
    const copy = { ...tournament, id: 't2', name: 'Cup (Copy)' };
    (db.createTournament as jest.Mock).mockResolvedValue(copy);
    (db.createParticipants as jest.Mock).mockResolvedValue([
      { ...participant('p1'), id: 'np1' },
    ]);
    (db.createMatches as jest.Mock).mockResolvedValue([]);
    (db.createGroup as jest.Mock).mockResolvedValue({});

    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={2} />
      </DataProvider>
    );

    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Clone'));

    await waitFor(() =>
      expect(db.createTournament).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cup (Copy)', status: 'draft' })
      )
    );
    expect(db.createParticipants).toHaveBeenCalled();
    expect(db.createMatches).toHaveBeenCalled();
    expect(db.createGroup).toHaveBeenCalled();
  });

  it('deletes a tournament after confirmation', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={2} />
      </DataProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Delete'));
    expect(db.deleteTournament).toHaveBeenCalledWith('t1');
  });

  it('keeps the tournament when delete is cancelled', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={2} />
      </DataProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Delete'));
    expect(db.deleteTournament).not.toHaveBeenCalled();
  });

  it('skips cloning participants and matches when none exist', async () => {
    (db.createTournament as jest.Mock).mockResolvedValue({
      ...tournament,
      id: 't2',
    });
    seed({ p: [], m: [] });

    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={0} />
      </DataProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Clone'));

    await waitFor(() => expect(db.createTournament).toHaveBeenCalled());
    expect(db.createParticipants).not.toHaveBeenCalled();
    expect(db.createMatches).not.toHaveBeenCalled();
    expect(db.createGroup).not.toHaveBeenCalled();
  });

  it('clones matches that have a missing first participant', async () => {
    (db.createTournament as jest.Mock).mockResolvedValue({
      ...tournament,
      id: 't2',
    });
    (db.createParticipants as jest.Mock).mockResolvedValue([
      { ...participant('p1'), id: 'np1' },
    ]);
    seed({
      m: [{ ...match('m1'), participant1Id: null, participant2Id: null }],
    });

    render(
      <DataProvider>
        <TournamentCard tournament={tournament} participantCount={1} />
      </DataProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Clone'));

    await waitFor(() => expect(db.createMatches).toHaveBeenCalled());
    expect(db.createMatches).toHaveBeenCalledWith([
      expect.objectContaining({ participant1Id: null, participant2Id: null }),
    ]);
  });

  it('hides the delete action for sample tournaments', async () => {
    seed();
    render(
      <DataProvider>
        <TournamentCard
          tournament={{ ...tournament, isSample: true }}
          participantCount={0}
        />
      </DataProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('Single Elimination')).toBeInTheDocument()
    );
    fireEvent.contextMenu(screen.getByText('Cup'), {
      clientX: 10,
      clientY: 10,
    });
    expect(screen.getByText('Clone')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
