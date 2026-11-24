import { fireEvent, render, screen } from '@testing-library/react';
import {
  SetEditor,
  type SetRow,
} from '@/components/pages/match-detail/SetEditor';

describe('SetEditor', () => {
  const sets: SetRow[] = [
    { p1Score: '11', p2Score: '8' },
    { p1Score: '9', p2Score: '11' },
  ];

  it('renders the sets and save button', () => {
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={jest.fn()}
        onSave={jest.fn()}
        saving={false}
      />
    );
    expect(screen.getByText('Sets (best of 3)')).toBeInTheDocument();
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Set 2')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Add Set')).toBeInTheDocument();
  });

  it('updates a score in a set', () => {
    const onSetsChange = jest.fn();
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={onSetsChange}
        onSave={jest.fn()}
        saving={false}
      />
    );
    fireEvent.change(screen.getByLabelText('Set 2 player 2 score'), {
      target: { value: '12' },
    });
    expect(onSetsChange).toHaveBeenCalledWith([
      { p1Score: '11', p2Score: '8' },
      { p1Score: '9', p2Score: '12' },
    ]);
  });

  it('adds a new set row', () => {
    const onSetsChange = jest.fn();
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={onSetsChange}
        onSave={jest.fn()}
        saving={false}
      />
    );
    fireEvent.click(screen.getByText('Add Set'));
    expect(onSetsChange).toHaveBeenCalledWith([
      { p1Score: '11', p2Score: '8' },
      { p1Score: '9', p2Score: '11' },
      { p1Score: '', p2Score: '' },
    ]);
  });

  it('removes a set row', () => {
    const onSetsChange = jest.fn();
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={onSetsChange}
        onSave={jest.fn()}
        saving={false}
      />
    );
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(onSetsChange).toHaveBeenCalledWith([
      { p1Score: '9', p2Score: '11' },
    ]);
  });

  it('hides the add button when the set limit is reached', () => {
    render(
      <SetEditor
        sets={sets}
        maxSets={2}
        onSetsChange={jest.fn()}
        onSave={jest.fn()}
        saving={false}
      />
    );
    expect(screen.queryByText('Add Set')).not.toBeInTheDocument();
  });

  it('shows a spinner while saving', () => {
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={jest.fn()}
        onSave={jest.fn()}
        saving
      />
    );
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(document.querySelector('.loading')).toBeInTheDocument();
  });

  it('saves when the save button is clicked', () => {
    const onSave = jest.fn();
    render(
      <SetEditor
        sets={sets}
        maxSets={3}
        onSetsChange={jest.fn()}
        onSave={onSave}
        saving={false}
      />
    );
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });
});
