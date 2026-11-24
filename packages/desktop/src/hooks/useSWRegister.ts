'use client';

import { useEffect } from 'react';

export const useSWRegister = (): void => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
          console.log('[SW] unregistered', reg.scope);
        }
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
            console.log('[SW] cleared cache', key);
          }
        });
      });
    } else {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] registered', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] registration failed', err);
        });
    }
  }, []);
};
