import { cn } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number | null;
  unit: string;
  tone?: 'default' | 'warning' | 'success';
}

export function UsageMeter({ label, used, limit, unit, tone = 'default' }: UsageMeterProps) {
  const unlimited = limit === null;
  const percent = !unlimited && limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 100;
  const nearLimit = percent >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-950">
          {unlimited ? `${used} ${unit} / 无上限` : `${used} / ${limit} ${unit}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500',
            tone === 'success' && 'bg-emerald-600',
            tone === 'warning' && 'bg-amber-500',
            tone === 'default' && (unlimited ? 'bg-emerald-500/40' : nearLimit ? 'bg-amber-500' : 'bg-emerald-600'),
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
