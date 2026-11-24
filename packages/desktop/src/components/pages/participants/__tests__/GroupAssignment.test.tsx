import { fireEvent, render, screen } from '@testing-library/react';
import { GroupAssignment } from '@/components/pages/participants/GroupAssignment';
import type { Participant } from '@/types';

describe('GroupAssignment', () => {
  const participants: Participant[] = [
    { id: 'p1', tournamentId: 't1', name: 'Alice', groupId: 'g1' },
    { id: 'p2', tournamentId: 't1', name: 'Bob' },
  ];

  it('renders group members and unassigned participants', () => {
    render(
      <GroupAssignment
        participants={participants}
        groups={[
          {
            id: 'g1',
            tournamentId: 't1',
            name: 'Group A',
            participantIds: ['p1'],
          },
        ]}
        onAssign={jest.fn()}
      />
    );
    expect(screen.getAllByText('Group A').length).toBeGreaterThan(0);
    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('Unassigned (1)')).toBeInTheDocument();
  });

  it('calls onAssign when a participant is moved to a group', () => {
    const onAssign = jest.fn();
    render(
      <GroupAssignment
        participants={participants}
        groups={[
          { id: 'g1', tournamentId: 't1', name: 'Group A', participantIds: [] },
        ]}
        onAssign={onAssign}
      />
    );

    fireEvent.change(screen.getByLabelText('Group for Bob'), {
      target: { value: 'g1' },
    });
    expect(onAssign).toHaveBeenCalledWith('p2', 'g1');

    fireEvent.change(screen.getByLabelText('Group for Bob'), {
      target: { value: '' },
    });
    expect(onAssign).toHaveBeenCalledWith('p2', undefined);
  });

  it('shows an empty state for empty groups', () => {
    render(
      <GroupAssignment
        participants={[]}
        groups={[
          { id: 'g1', tournamentId: 't1', name: 'Group A', participantIds: [] },
        ]}
        onAssign={jest.fn()}
      />
    );
    expect(screen.getByText('Empty group.')).toBeInTheDocument();
  });
});
