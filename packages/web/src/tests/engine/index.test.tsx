import { render } from '@testing-library/react';
import EnginePage from '../../pages/engine/[id]';

jest.mock('next/router', () => {
  const useRouter = jest.fn().mockReturnValue({ query: { id: 'id' } });
  return { useRouter };
});

describe('EnginePage', () => {
  test('render default', () => {
    const wrapper = render(<EnginePage></EnginePage>);
    expect(wrapper.container).toMatchSnapshot();
  });
});
