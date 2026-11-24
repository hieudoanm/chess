import { render, screen } from '@testing-library/react';
import { Leaderboard } from '@/components/pages/profile/Leaderboard';
import type { Match, Participant } from '@/types';

const match = (
  id: string,
  scheduledAt: number | undefined,
  round = 1
): Match => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
  scheduledAt,
});

describe('Leaderboard', () => {
  const participants: Participant[] = [
    { id: 'a', tournamentId: 't1', name: 'Alice' },
    { id: 'b', tournamentId: 't1', name: 'Bob' },
  ];

  it('shows an empty state when there are no results', () => {
    render(<Leaderboard matches={[]} participants={participants} />);
    expect(screen.getByText(/No results yet/)).toBeInTheDocument();
  });

  it('aggregates results across tournaments by points', () => {
    const matches: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'a',
        participant2Id: 'b',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'a',
        status: 'completed',
      },
    ];
    render(<Leaderboard matches={matches} participants={participants} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('3 pts')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('counts draws when there is no winner', () => {
    const matches: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'a',
        participant2Id: 'b',
        winnerId: null,
        status: 'completed',
      },
    ];
    render(<Leaderboard matches={matches} participants={participants} />);
    expect(screen.getAllByText('1 pts')).toHaveLength(2);
  });

  it('ignores matches for unknown participants', () => {
    const matches: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'ghost',
        participant2Id: 'other',
        winnerId: 'ghost',
        status: 'completed',
      },
    ];
    render(<Leaderboard matches={matches} participants={participants} />);
    expect(screen.getByText(/No results yet/)).toBeInTheDocument();
  });

  it('scores wins for participant two', () => {
    const matches: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'a',
        participant2Id: 'b',
        participant1Score: 1,
        participant2Score: 2,
        winnerId: 'b',
        status: 'completed',
      },
    ];
    render(<Leaderboard matches={matches} participants={participants} />);
    expect(screen.getByText('3 pts')).toBeInTheDocument();
    expect(screen.getAllByText('1 played').length).toBeGreaterThan(0);
  });

  it('aggregates across multiple matches per participant', () => {
    const matches: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'a',
        participant2Id: 'b',
        participant1Score: 1,
        participant2Score: 0,
        winnerId: 'a',
        status: 'completed',
      },
      {
        ...match('m2', undefined),
        participant1Id: 'a',
        participant2Id: 'b',
        participant1Score: 1,
        participant2Score: 2,
        winnerId: 'b',
        status: 'completed',
      },
    ];
    render(<Leaderboard matches={matches} participants={participants} />);

    const alice = screen.getByText('Alice').closest('li');
    expect(alice).toHaveTextContent('2 played');
    expect(alice).toHaveTextContent('3 pts');
  });
});
