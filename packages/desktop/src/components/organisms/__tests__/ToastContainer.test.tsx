import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/providers/ToastProvider';
import { ToastContainer } from '@/components/organisms/ToastContainer';

const Pusher = ({ message }: { message: string }) => {
  const { addToast } = useToast();
  return <button onClick={() => addToast(message, 'success')}>push</button>;
};

describe('ToastContainer', () => {
  it('renders nothing with no toasts', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('renders toasts and removes them on click', () => {
    render(
      <ToastProvider>
        <Pusher message="Saved" />
        <ToastContainer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'push' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Saved'));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
});
