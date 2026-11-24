export const startDomObserver = (
  onDomChange: () => void,
  debounceMs = 150
): MutationObserver => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = (): void => {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      onDomChange();
    }, debounceMs);
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        schedule();
        return;
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return observer;
};

export const startSpaWatcher = (
  onNavigate: () => void,
  intervalMs = 500
): ReturnType<typeof setInterval> => {
  let lastUrl = window.location.href;
  return setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      onNavigate();
    }
  }, intervalMs);
};
