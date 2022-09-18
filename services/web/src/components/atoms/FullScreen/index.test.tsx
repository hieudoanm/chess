import { render } from '@testing-library/react';
import FullScreen from '.';

describe('FullScreen', () => {
  test('render default', () => {
    const wrapper = render(<FullScreen>FullScreen</FullScreen>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
