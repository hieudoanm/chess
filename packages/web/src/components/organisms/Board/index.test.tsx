import { render } from '@testing-library/react';
import Board from '.';

describe('Board', () => {
  test('render default', () => {
    const wrapper = render(<Board id="id"></Board>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
