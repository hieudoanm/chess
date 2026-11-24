import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ParticipantList } from '@/components/organisms/ParticipantList';
import type { Participant } from '@/types';

const participant = (id: string): Participant => ({
  id,
  tournamentId: 't1',
  name: `Player ${id}`,
  seed: 1,
});

describe('ParticipantList', () => {
  it('renders participants with seeds and remove buttons', () => {
    const onRemove = jest.fn();
    render(
      <ParticipantList
        participants={[
          participant('p1'),
          { ...participant('p2'), seed: undefined },
        ]}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('Player p1')).toBeInTheDocument();
    expect(screen.getByText('Seed 1')).toBeInTheDocument();
    expect(screen.getByText('Player p2')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(onRemove).toHaveBeenCalledWith('p1');
  });

  it('adds a participant by name', () => {
    const onAdd = jest.fn();
    render(<ParticipantList participants={[]} onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'New Player' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith('New Player');
  });

  it('does not add empty names', () => {
    const onAdd = jest.fn();
    render(<ParticipantList participants={[]} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('adds a participant when the Enter key is pressed', () => {
    const onAdd = jest.fn();
    render(<ParticipantList participants={[]} onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText('Participant name'), {
      target: { value: 'Via Enter' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Participant name'), {
      key: 'Enter',
    });
    expect(onAdd).toHaveBeenCalledWith('Via Enter');
  });

  it('shows the empty message when no participants', () => {
    render(<ParticipantList participants={[]} />);
    expect(screen.getByText('No participants yet')).toBeInTheDocument();
  });

  it('batch adds names from the textarea', () => {
    const onBatchAdd = jest.fn();
    render(<ParticipantList participants={[]} onBatchAdd={onBatchAdd} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByPlaceholderText('One name per line'), {
      target: { value: 'A\n\nB  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add All' }));
    expect(onBatchAdd).toHaveBeenCalledWith(['A', 'B']);
  });

  it('skips batch add when the textarea is empty', () => {
    const onBatchAdd = jest.fn();
    render(<ParticipantList participants={[]} onBatchAdd={onBatchAdd} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Add All' }));
    expect(onBatchAdd).not.toHaveBeenCalled();
  });
});
