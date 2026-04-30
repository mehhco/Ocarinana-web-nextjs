'use client';

import type { ClipboardEvent, CompositionEvent, KeyboardEvent, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface LyricsInputProps {
  value: string;
  active?: boolean;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: (node: HTMLInputElement | null) => void;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  onCompositionStart?: (event: CompositionEvent<HTMLInputElement>) => void;
  onCompositionEnd?: (event: CompositionEvent<HTMLInputElement>) => void;
}

export function LyricsInput({
  value,
  active = false,
  disabled = false,
  placeholder = '歌词',
  inputRef,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onPaste,
  onCompositionStart,
  onCompositionEnd,
}: LyricsInputProps) {
  const stopPointerPropagation = (event: MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onClick={stopPointerPropagation}
      onMouseDown={stopPointerPropagation}
      className={cn(
        'h-6 w-16 rounded-md border px-1 text-center text-sm leading-none transition-all',
        'bg-transparent text-slate-700 placeholder:text-slate-300',
        active
          ? 'border-indigo-400 bg-white shadow-sm ring-1 ring-indigo-300'
          : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
        'focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    />
  );
}
