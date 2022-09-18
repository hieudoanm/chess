import { render } from '@testing-library/react';
import Square from '.';

describe('Square', () => {
  test('render default', () => {
    const wrapper = render(<Square>Square</Square>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
