import { render } from '@testing-library/react';
import Coordinates from '.';
import { COORDINATES } from '../../../constants';

describe('Coordinates', () => {
  test('render default', () => {
    const wrapper = render(
      <Coordinates
        coordinates={COORDINATES}
        movePiece={() => {
          return;
        }}
      ></Coordinates>
    );
    expect(wrapper.container).toMatchSnapshot();
  });
});
