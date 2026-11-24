import {
  sampleTournaments,
  sampleParticipants,
  sampleMatches,
  sampleGroups,
} from '@/lib/sample-data';

describe('sample-data', () => {
  it('exposes one tournament per format', () => {
    const formats = sampleTournaments.map((t) => t.format);
    expect(formats).toEqual([
      'single-elimination',
      'double-elimination',
      'round-robin',
      'swiss',
      'group-stage',
      'league',
    ]);
  });

  it('builds well-formed tournaments', () => {
    for (const tournament of sampleTournaments) {
      expect(tournament.id).toBeTruthy();
      expect(tournament.name).toBeTruthy();
      expect(tournament.maxParticipants).toBeGreaterThan(0);
      expect(tournament.createdAt).toBeGreaterThan(0);
      expect(tournament.isSample).toBe(true);
    }
  });

  it('links every participant to an existing tournament', () => {
    const ids = new Set(sampleTournaments.map((t) => t.id));
    expect(sampleParticipants.length).toBeGreaterThan(0);
    for (const participant of sampleParticipants) {
      expect(ids.has(participant.tournamentId)).toBe(true);
      expect(participant.id).toBeTruthy();
      expect(participant.name).toBeTruthy();
    }
  });

  it('links every match to an existing tournament', () => {
    const ids = new Set(sampleTournaments.map((t) => t.id));
    expect(sampleMatches.length).toBeGreaterThan(0);
    for (const match of sampleMatches) {
      expect(ids.has(match.tournamentId)).toBe(true);
      expect(match.round).toBeGreaterThan(0);
      expect(match.status).toBeTruthy();
    }
  });

  it('includes completed matches with winners and scores', () => {
    const completed = sampleMatches.filter((m) => m.status === 'completed');
    const resolved = completed.filter(
      (m) =>
        m.winnerId &&
        m.participant1Score !== null &&
        m.participant2Score !== null
    );
    expect(resolved.length).toBeGreaterThan(0);
    for (const match of resolved) {
      expect(match.participant1Score).not.toBeNull();
      expect(match.participant2Score).not.toBeNull();
    }
  });

  it('builds well-formed groups', () => {
    expect(sampleGroups.length).toBeGreaterThan(0);
    const ids = new Set(sampleParticipants.map((p) => p.id));
    for (const group of sampleGroups) {
      expect(group.tournamentId).toBeTruthy();
      expect(group.name).toBeTruthy();
      for (const participantId of group.participantIds) {
        expect(ids.has(participantId)).toBe(true);
      }
    }
  });
});
