import { fireEvent, render, screen } from '@testing-library/react';
import { BracketView } from '@/components/organisms/BracketView';

describe('BracketView', () => {
  const matches = [
    {
      id: 'm1',
      tournamentId: 't1',
      round: 1,
      status: 'completed' as const,
      participant1Id: 'p1',
      participant2Id: 'p2',
      participant1Score: 2,
      participant2Score: 0,
      winnerId: 'p1',
      scheduledAt: 0,
    },
  ];

  it('renders elimination brackets with rounds', () => {
    render(<BracketView matches={matches} format="single-elimination" />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('renders list brackets for round robin', () => {
    render(<BracketView matches={matches} format="round-robin" />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('splits group stage into group and knockout phases', () => {
    render(
      <BracketView
        matches={[
          ...matches,
          { ...matches[0], id: 'm2', bracket: 'final' as const, round: 2 },
        ]}
        format="group-stage"
      />
    );
    expect(screen.getByText('Group Phase')).toBeInTheDocument();
    expect(screen.getByText('Knockout Bracket')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('calls onMatchClick when provided', () => {
    const onMatchClick = jest.fn();
    render(
      <BracketView
        matches={matches}
        format="single-elimination"
        onMatchClick={onMatchClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onMatchClick).toHaveBeenCalledWith('m1');
  });

  it('groups matches without a round under round zero', () => {
    const { round: _round, ...noRound } = matches[0];
    render(
      <BracketView
        matches={[noRound as unknown as (typeof matches)[0]]}
        format="group-stage"
      />
    );
    expect(screen.getByText('Round 0')).toBeInTheDocument();
    expect(screen.getByText('Group Phase')).toBeInTheDocument();
  });
});
