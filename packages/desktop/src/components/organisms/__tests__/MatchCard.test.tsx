import { fireEvent, render, screen } from '@testing-library/react';
import { MatchCard } from '@/components/organisms/MatchCard';
import type { Participant } from '@/types';

const participant = (id: string, name: string): Participant => ({
  id,
  tournamentId: 't1',
  name,
});

describe('MatchCard', () => {
  const match = {
    id: 'm1',
    tournamentId: 't1',
    round: 1,
    status: 'completed' as const,
    participant1Id: 'p1',
    participant2Id: 'p2',
    participant1Score: 3,
    participant2Score: 1,
    winnerId: 'p1',
    scheduledAt: 1700000000000,
  };

  it('shows names, scores, and winner styling', () => {
    render(
      <MatchCard
        match={match}
        participant1={participant('p1', 'Alpha')}
        participant2={participant('p2', 'Beta')}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('falls back to TBD and hides scores for non-completed matches', () => {
    render(
      <MatchCard
        match={{
          ...match,
          status: 'scheduled',
          participant1Score: null,
          participant2Score: null,
        }}
      />
    );
    expect(screen.getAllByText('TBD')).toHaveLength(2);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('fires onClick when provided', () => {
    const onClick = jest.fn();
    render(
      <MatchCard match={{ ...match, status: 'scheduled' }} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('styles the winner when the second participant wins', () => {
    const { container } = render(
      <MatchCard
        match={{ ...match, winnerId: 'p2' }}
        participant1={participant('p1', 'Alpha')}
        participant2={participant('p2', 'Beta')}
      />
    );
    const rows = container.querySelectorAll(
      'div.flex.items-center.justify-between'
    );
    expect(rows[2].className).toContain('text-primary');
    expect(rows[1].className).not.toContain('text-primary');
  });
});
