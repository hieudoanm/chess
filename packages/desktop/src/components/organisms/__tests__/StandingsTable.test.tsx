import { render, screen } from '@testing-library/react';
import { StandingsTable } from '@/components/organisms/StandingsTable';
import type { Participant, Standing } from '@/types';

const participant = (id: string, name: string): Participant => ({
  id,
  tournamentId: 't1',
  name,
});

describe('StandingsTable', () => {
  const standings: Standing[] = [
    {
      participantId: 'p1',
      tournamentId: 't1',
      played: 2,
      won: 2,
      drawn: 0,
      lost: 0,
      points: 6,
      position: 1,
    },
    {
      participantId: 'missing',
      tournamentId: 't1',
      played: 1,
      won: 0,
      drawn: 1,
      lost: 0,
      points: 1,
      position: 2,
    },
  ];

  it('renders rows with names, falling back to Unknown', () => {
    render(
      <StandingsTable
        standings={standings}
        participants={[participant('p1', 'Alpha')]}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('renders rows beyond the top three without a medal class', () => {
    const { container } = render(
      <StandingsTable
        standings={[
          ...standings,
          {
            participantId: 'p3',
            tournamentId: 't1',
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            position: 3,
          },
          {
            participantId: 'p4',
            tournamentId: 't1',
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            position: 4,
          },
        ]}
        participants={[]}
      />
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveClass('text-yellow-500');
    expect(rows[3].getAttribute('class')).toBeNull();
  });
});
