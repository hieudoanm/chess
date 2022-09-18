import { render } from '@testing-library/react';
import HomePage from '../pages';

jest.mock('nanoid', () => {
  const mockNanoid = jest.fn().mockReturnValue('id');
  return { nanoid: mockNanoid };
});

describe('HomePage', () => {
  test('render default', () => {
    const wrapper = render(<HomePage></HomePage>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
