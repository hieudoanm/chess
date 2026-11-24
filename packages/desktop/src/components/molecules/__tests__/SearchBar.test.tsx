import { fireEvent, render, screen } from '@testing-library/react';
import { SearchBar } from '@/components/molecules/SearchBar';

describe('SearchBar', () => {
  it('forwards the input value', () => {
    const onChange = jest.fn();
    render(<SearchBar value="cup" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Search tournaments...');
    expect(input).toHaveValue('cup');
    fireEvent.change(input, { target: { value: 'league' } });
    expect(onChange).toHaveBeenCalledWith('league');
  });
});
