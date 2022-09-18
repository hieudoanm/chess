import { render } from '@testing-library/react';
import LivePage from '../../pages/live/[id]';

jest.mock('next/router', () => {
  const useRouter = jest.fn().mockReturnValue({ query: { id: 'id' } });
  return { useRouter };
});

describe('LivePage', () => {
  test('render default', () => {
    const wrapper = render(<LivePage></LivePage>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
