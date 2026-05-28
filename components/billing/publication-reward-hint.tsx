import { Gift, Globe2 } from 'lucide-react';

export function PublicationRewardHint() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 py-2 text-xs text-zinc-600">
      <Gift className="h-3.5 w-3.5 shrink-0 text-emerald-700/80" aria-hidden="true" />
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="inline-flex items-center gap-1 font-medium text-zinc-700">
          <Globe2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          公开优质乐谱可获得 Plus 体验奖励
        </span>
        <span className="hidden text-zinc-500 md:inline">
          完善后设为公开，系统通过基础质量检查后会发放体验权益。
        </span>
      </div>
    </div>
  );
}
