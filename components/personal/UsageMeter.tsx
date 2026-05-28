import { cn } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit: string;
  tone?: 'default' | 'warning' | 'success';
}

export function UsageMeter({ label, used, limit, unit, tone = 'default' }: UsageMeterProps) {
  const percent = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const nearLimit = percent >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-950">
          {used} / {limit} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500',
            tone === 'success' && 'bg-emerald-600',
            tone === 'warning' && 'bg-amber-500',
            tone === 'default' && (nearLimit ? 'bg-amber-500' : 'bg-emerald-600'),
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
