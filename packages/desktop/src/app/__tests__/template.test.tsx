import { render, screen, act } from '@testing-library/react';
import PageTransitionTemplate from '@/app/template';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PageTransitionTemplate', () => {
  it('renders children', () => {
    render(
      <PageTransitionTemplate>
        <p>hello</p>
      </PageTransitionTemplate>
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies animate-page-in class after mount', () => {
    const { container } = render(
      <PageTransitionTemplate>
        <p>content</p>
      </PageTransitionTemplate>
    );
    act(() => {});
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('animate-page-in')).toBe(true);
  });

  it('removes animate-page-in class on animationend', () => {
    const { container } = render(
      <PageTransitionTemplate>
        <p>content</p>
      </PageTransitionTemplate>
    );
    act(() => {});
    const wrapper = container.firstElementChild as HTMLElement;
    act(() => {
      wrapper.dispatchEvent(new Event('animationend'));
    });
    expect(wrapper.classList.contains('animate-page-in')).toBe(false);
  });

  it('does not throw if ref is null during cleanup', () => {
    const { unmount } = render(
      <PageTransitionTemplate>
        <p>content</p>
      </PageTransitionTemplate>
    );
    act(() => {});
    unmount();
  });

  it('does not re-add class if animate-page-in is absent on animationend', () => {
    const { container } = render(
      <PageTransitionTemplate>
        <p>content</p>
      </PageTransitionTemplate>
    );
    act(() => {});
    const wrapper = container.firstElementChild as HTMLElement;
    wrapper.classList.remove('animate-page-in');
    act(() => {
      wrapper.dispatchEvent(new Event('animationend'));
    });
    expect(wrapper.classList.contains('animate-page-in')).toBe(false);
  });
});
