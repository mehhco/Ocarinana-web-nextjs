'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileSheetProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  panelClassName?: string;
}

export function MobileSheet({
  open,
  title,
  description,
  children,
  onClose,
  panelClassName,
}: MobileSheetProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        aria-label="关闭面板"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-sheet-title"
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.18)]',
          panelClassName,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 pb-3 pt-2">
          <div className="min-w-0">
            <h2 id="mobile-sheet-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl leading-none text-slate-600 active:bg-slate-200"
            aria-label={`关闭${title}`}
          >
            ×
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </section>
    </div>
  );
}

