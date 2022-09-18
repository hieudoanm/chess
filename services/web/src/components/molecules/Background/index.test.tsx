import { render } from '@testing-library/react';
import Background from '.';

describe('Background', () => {
  test('render default', () => {
    const wrapper = render(<Background></Background>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
