import { CheckIcon } from '@/components/ui/icons';
import type { UserEntitlements } from '@/lib/billing/entitlements';
import { formatDateTime } from '@/lib/personal-center';

interface PlanStatusCardProps {
  entitlements: UserEntitlements;
}

export function PlanStatusCard({ entitlements }: PlanStatusCardProps) {
  const features = entitlements.isPlus
    ? ['100 首私有乐谱', '50 首公开乐谱', '每日 100 次导出', '无水印导出']
    : ['5 首私有乐谱', '3 首公开乐谱', '每日 3 次导出', '基础编辑器'];

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">当前权益</p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-950">
            {entitlements.isPlus ? 'Plus 已开通' : '免费版'}
          </h2>
        </div>
        <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
          {entitlements.isPlus ? 'plus' : 'free'}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-600">
        {entitlements.isPlus
          ? `有效期至 ${formatDateTime(entitlements.currentPeriodEnd)}`
          : '升级 Plus 后可扩容保存、公开和导出额度。'}
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-zinc-700">
            <CheckIcon className="h-4 w-4 text-emerald-700" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
