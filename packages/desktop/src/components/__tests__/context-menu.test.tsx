import { act, fireEvent, render, screen } from '@testing-library/react';
import { ContextMenu } from '@/components/atoms/ContextMenu';

const renderMenu = () =>
  render(
    <ContextMenu
      items={[
        { label: 'Action', onClick: jest.fn() },
        { label: 'Delete', destructive: true, onClick: jest.fn() },
      ]}>
      <button>Trigger</button>
    </ContextMenu>
  );

describe('ContextMenu', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens on context menu and closes with the Escape key', () => {
    renderMenu();
    fireEvent.contextMenu(screen.getByText('Trigger'), {
      clientX: 10,
      clientY: 10,
    });
    expect(screen.getByText('Action')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the menu', () => {
    renderMenu();
    fireEvent.contextMenu(screen.getByText('Trigger'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('opens after a long touch press', () => {
    jest.useFakeTimers();
    renderMenu();
    fireEvent.touchStart(screen.getByText('Trigger'), {
      touches: [{ clientX: 20, clientY: 30 }],
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('cancels the long press when touch ends early', () => {
    jest.useFakeTimers();
    renderMenu();
    fireEvent.touchStart(screen.getByText('Trigger'), {
      touches: [{ clientX: 20, clientY: 30 }],
    });
    fireEvent.touchEnd(screen.getByText('Trigger'));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('invokes an item callback and closes on click', () => {
    const onClick = jest.fn();
    render(
      <ContextMenu items={[{ label: 'Go', onClick }]}>
        <button>Trigger</button>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText('Trigger'), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByText('Go')).not.toBeInTheDocument();
  });

  it('stays closed until opened', () => {
    const item = { label: 'Delete', destructive: true, onClick: jest.fn() };
    render(
      <ContextMenu items={[item]}>
        <span>target</span>
      </ContextMenu>
    );
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('opens on context menu and triggers the item action', () => {
    const item = { label: 'Delete', destructive: true, onClick: jest.fn() };
    render(
      <ContextMenu items={[item]}>
        <span>target</span>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText('target'), {
      clientX: 100,
      clientY: 100,
    });
    expect(screen.getByText('Delete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    expect(item.onClick).toHaveBeenCalled();
  });

  it('renders non-destructive items without the destructive style', () => {
    const normal = { label: 'Rename', onClick: jest.fn() };
    render(
      <ContextMenu items={[normal]}>
        <span>target</span>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText('target'), {
      clientX: 100,
      clientY: 100,
    });
    expect(screen.getByText('Rename')).toBeInTheDocument();
  });
});
