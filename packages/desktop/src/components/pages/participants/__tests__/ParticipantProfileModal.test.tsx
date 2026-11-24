import { fireEvent, render, screen } from '@testing-library/react';
import { ParticipantProfileModal } from '@/components/pages/participants/ParticipantProfileModal';
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

describe('ParticipantProfileModal', () => {
  const participant: Participant = {
    id: 'p1',
    tournamentId: 't1',
    name: 'Alice',
    seed: 2,
    rating: 1500,
  };

  const matches: Match[] = [
    {
      ...match('m1', undefined),
      participant1Id: 'p1',
      participant2Id: 'p2',
      participant1Score: 3,
      participant2Score: 1,
      winnerId: 'p1',
      status: 'completed',
    },
    {
      ...match('m2', undefined),
      participant1Id: 'p2',
      participant2Id: 'p1',
      participant1Score: 1,
      participant2Score: 0,
      winnerId: 'p2',
      status: 'completed',
    },
  ];

  it('renders nothing when participant is null', () => {
    const { container } = render(
      <ParticipantProfileModal
        participant={null}
        matches={matches}
        getParticipantName={() => 'Name'}
        onClose={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows stats, matches, and closes', () => {
    const onClose = jest.fn();
    render(
      <ParticipantProfileModal
        participant={participant}
        matches={matches}
        getParticipantName={(id) => (id === 'p2' ? 'Bob' : 'Alice')}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Seed: 2')).toBeInTheDocument();
    expect(screen.getByText('Rating: 1500')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText(/vs Bob/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a dash for a missing seed and dashes for null scores', () => {
    const onClose = jest.fn();
    const noSeed: Participant = { id: 'p9', tournamentId: 't1', name: 'Carol' };
    const scheduled: Match[] = [
      {
        ...match('m1', undefined),
        participant1Id: 'p9',
        participant2Id: 'p2',
        status: 'scheduled',
      },
    ];
    render(
      <ParticipantProfileModal
        participant={noSeed}
        matches={scheduled}
        getParticipantName={(id) => (id === 'p2' ? 'Bob' : 'Carol')}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Seed: -')).toBeInTheDocument();
    expect(screen.queryByText(/Rating:/)).not.toBeInTheDocument();
    expect(screen.getByText('- : -')).toBeInTheDocument();
    expect(screen.getByText('scheduled')).toBeInTheDocument();
  });

  it('sorts recent matches by round descending', () => {
    const onClose = jest.fn();
    const roundOne: Match = {
      ...match('m1', undefined, 1),
      participant1Id: 'p1',
      participant2Id: 'p2',
      participant1Score: 1,
      participant2Score: 2,
      winnerId: 'p2',
      status: 'completed',
    };
    const roundTwo: Match = {
      ...match('m2', undefined, 2),
      participant1Id: 'p1',
      participant2Id: 'p2',
      participant1Score: 2,
      participant2Score: 1,
      winnerId: 'p1',
      status: 'completed',
    };
    render(
      <ParticipantProfileModal
        participant={participant}
        matches={[roundOne, roundTwo]}
        getParticipantName={(id) => (id === 'p2' ? 'Bob' : 'Alice')}
        onClose={onClose}
      />
    );

    const rows = screen.getAllByText(/vs Bob/).map((el) => el.closest('div'));
    expect(rows[0]).toHaveTextContent('2 : 1');
    expect(rows[1]).toHaveTextContent('1 : 2');
  });

  it('shows an empty matches message', () => {
    render(
      <ParticipantProfileModal
        participant={participant}
        matches={[]}
        getParticipantName={() => 'Name'}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('No matches yet.')).toBeInTheDocument();
  });
});
