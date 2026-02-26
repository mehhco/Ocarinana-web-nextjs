'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LyricsInputProps {
  text: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
}

export function LyricsInput({ text, onChange, onBlur }: LyricsInputProps) {
  const [localValue, setLocalValue] = useState(text);

  useEffect(() => {
    setLocalValue(text);
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onChange(value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder="词"
      className={cn(
        "w-16 h-6 text-xs text-center border border-transparent",
        "bg-transparent hover:bg-muted/50 focus:bg-white",
        "focus:border-primary focus:ring-1 focus:ring-primary",
        "rounded px-1 py-0.5",
        "transition-all duration-150",
        "placeholder:text-muted-foreground/50"
      )}
    />
  );
}
