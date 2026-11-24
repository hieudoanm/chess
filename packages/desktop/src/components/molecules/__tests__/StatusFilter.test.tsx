import { fireEvent, render, screen } from '@testing-library/react';
import { StatusFilter } from '@/components/molecules/StatusFilter';

describe('StatusFilter', () => {
  it('renders all filters and marks the active one', () => {
    const onChange = jest.fn();
    render(<StatusFilter value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(onChange).toHaveBeenCalledWith('completed');
  });
});
