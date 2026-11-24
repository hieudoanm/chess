import { fireEvent, render, screen } from '@testing-library/react';
import { ParticipantList } from '@/components/pages/participants/ParticipantList';
import type { Participant } from '@/types';

describe('ParticipantList', () => {
  const participants: Participant[] = [
    { id: 'p1', tournamentId: 't1', name: 'Alice', seed: 1, rating: 1500 },
  ];

  it('renders seed and rating inputs when callbacks are provided', () => {
    const onSeedChange = jest.fn();
    const onRatingChange = jest.fn();
    render(
      <ParticipantList
        participants={participants}
        onRemove={jest.fn()}
        onSeedChange={onSeedChange}
        onRatingChange={onRatingChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Seed for Alice'), {
      target: { value: '5' },
    });
    expect(onSeedChange).toHaveBeenCalledWith('p1', 5);

    fireEvent.change(screen.getByLabelText('Rating for Alice'), {
      target: { value: '2000' },
    });
    expect(onRatingChange).toHaveBeenCalledWith('p1', 2000);

    fireEvent.change(screen.getByLabelText('Rating for Alice'), {
      target: { value: '' },
    });
    expect(onRatingChange).toHaveBeenCalledWith('p1', 0);
  });

  it('shows static seed and rating when callbacks are missing', () => {
    render(
      <ParticipantList participants={participants} onRemove={jest.fn()} />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('shows a dash for a missing seed and omits an undefined rating', () => {
    render(
      <ParticipantList
        participants={[{ id: 'p2', tournamentId: 't1', name: 'Bob' }]}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText('#-')).toBeInTheDocument();
  });

  it('calls onSelect when the name is clicked', () => {
    const onSelect = jest.fn();
    render(
      <ParticipantList
        participants={participants}
        onRemove={jest.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /View profile/ }));
    expect(onSelect).toHaveBeenCalledWith(participants[0]);
  });
});
