import { render } from '@testing-library/react';
import Rank from '.';

describe('Rank', () => {
  test('render default', () => {
    const wrapper = render(<Rank></Rank>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
