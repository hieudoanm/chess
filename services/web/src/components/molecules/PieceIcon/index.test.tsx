import { render } from '@testing-library/react';
import PieceIcon from '.';

describe('PieceIcon', () => {
  test('render default', () => {
    const wrapper = render(<PieceIcon piece="" side=""></PieceIcon>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
