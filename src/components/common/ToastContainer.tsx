import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissToast } from '@/store/slices/uiSlice';

export default function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timers = toasts.map((t) =>
      window.setTimeout(() => dispatch(dismissToast(t.id)), 3200),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92%] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-xl px-4 py-3 shadow-lg text-sm font-medium border backdrop-blur
            ${t.type === 'success' ? 'bg-pitch-500/90 border-pitch-400 text-night-900' : ''}
            ${t.type === 'error' ? 'bg-stump-500/90 border-stump-400 text-white' : ''}
            ${t.type === 'info' ? 'bg-night-500/95 border-night-400 text-slate-100' : ''}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
