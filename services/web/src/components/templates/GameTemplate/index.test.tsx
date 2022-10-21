import { render } from '@testing-library/react';
import GameTemplate from '.';

describe('GameTemplate', () => {
  test('render default', () => {
    const wrapper = render(<GameTemplate id="id"></GameTemplate>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
