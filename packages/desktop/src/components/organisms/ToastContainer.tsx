'use client';

import { useToast } from '@/providers/ToastProvider';
import type { Toast } from '@/providers/ToastProvider';

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${TOAST_STYLES[toast.type]} max-w-sm cursor-pointer shadow-lg`}
          onClick={() => removeToast(toast.id)}>
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
