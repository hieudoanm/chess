'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
}

export const ContextMenu = ({ items, children }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const openAt = useCallback((x: number, y: number) => {
    setPos({ x, y });
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [visible, close]);

  useEffect(() => {
    if (!visible) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [visible, close]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openAt(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openAt(touch.clientX, touch.clientY);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const menuStyle = visible
    ? {
        left: `${Math.min(pos.x, window.innerWidth - 160)}px`,
        top: `${Math.min(pos.y, window.innerHeight - 120)}px`,
      }
    : { left: 0, top: 0 };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        className="contents">
        {children}
      </div>
      {visible && (
        <div
          ref={menuRef}
          className="border-base-300 bg-base-100 rounded-box fixed z-50 max-w-[calc(100vw-2rem)] min-w-[9rem] border p-1 shadow-lg"
          style={menuStyle}>
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                close();
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm ${
                item.destructive
                  ? 'text-error hover:bg-error/10'
                  : 'hover:bg-base-200'
              }`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
