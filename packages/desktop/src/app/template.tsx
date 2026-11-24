'use client';

import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';

const PageTransitionTemplate: FC<{ children: ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    const el = ref.current;
    if (!el) return;
    const onEnd = () => {
      if (el.classList.contains('animate-page-in')) {
        el.classList.remove('animate-page-in');
      }
    };
    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, []);

  return (
    <div ref={ref} className={ready ? 'animate-page-in' : ''}>
      {children}
    </div>
  );
};

export default PageTransitionTemplate;
