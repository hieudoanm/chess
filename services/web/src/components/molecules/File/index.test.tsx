import { render } from '@testing-library/react';
import File from '.';

describe('File', () => {
  test('render default', () => {
    const wrapper = render(<File></File>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
