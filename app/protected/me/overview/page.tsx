import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PlanStatusCard } from '@/components/personal/PlanStatusCard';
import { UpgradePrompt } from '@/components/personal/UpgradePrompt';
import { UsageMeter } from '@/components/personal/UsageMeter';
import { Button } from '@/components/ui/button';
import { ArrowUpRightIcon, MusicIcon, PlusIcon, SparklesIcon } from '@/components/ui/icons';
import { getPersonalCenterData } from '@/lib/personal-center';
import { createClient } from '@/lib/supabase/server';

function getPrimaryAction(input: {
  totalScores: number;
  publicScores: number;
  isNearPrivateLimit: boolean;
}) {
  if (input.totalScores === 0) {
    return {
      href: '/protected/editor/v2/new',
      label: '创建第一首乐谱',
      icon: PlusIcon,
    };
  }

  if (input.isNearPrivateLimit) {
    return {
      href: '/protected/me/plus?reason=score-limit',
      label: '升级扩容',
      icon: SparklesIcon,
    };
  }

  if (input.publicScores === 0) {
    return {
      href: '/protected/me/scores',
      label: '公开乐谱获得 Plus',
      icon: ArrowUpRightIcon,
    };
  }

  return {
    href: '/protected/editor/v2/new',
    label: '继续创作',
    icon: PlusIcon,
  };
}

export default async function MeOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const data = await getPersonalCenterData(user.id);
  const { entitlements, scoreStats, usage, rewardProgress } = data;
  const isNearPrivateLimit = !entitlements.isPlus && scoreStats.total >= entitlements.privateScoreLimit * 0.8;
  const PrimaryIcon = getPrimaryAction({
    totalScores: scoreStats.total,
    publicScores: scoreStats.public,
    isNearPrivateLimit,
  }).icon;
  const primaryAction = getPrimaryAction({
    totalScores: scoreStats.total,
    publicScores: scoreStats.public,
    isNearPrivateLimit,
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-md border border-zinc-200 bg-[#fbfaf6] p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-zinc-500">欢迎回来</p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-950">
            {user.email || '继续管理你的陶笛谱'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            这里汇总你的创作进度、保存额度、公开奖励和当前 Plus 权益。
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href={primaryAction.href}>
            <PrimaryIcon className="h-5 w-5" />
            {primaryAction.label}
          </Link>
        </Button>
      </section>

      {isNearPrivateLimit && (
        <UpgradePrompt
          title="保存额度接近上限"
          description={`你已保存 ${scoreStats.total} 首乐谱，免费版最多保存 ${entitlements.privateScoreLimit} 首。公开乐谱不受数量限制；升级 Plus 后可保存 100 首私有乐谱。`}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '乐谱数量', value: scoreStats.total, suffix: '首', href: '/protected/me/scores' },
          { label: '公开乐谱', value: scoreStats.public, suffix: '首', href: '/protected/me/scores' },
          { label: '今日导出', value: usage.exportCountToday, suffix: '次' },
          { label: 'Plus 状态', value: entitlements.isPlus ? '已开通' : '免费版', suffix: '' },
        ].map((metric) => (
          <article key={metric.label} className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{metric.label}</p>
            <div className="mt-3 flex items-end gap-2">
              {metric.href ? (
                <Link
                  href={metric.href}
                  aria-label={`查看${metric.label}`}
                  className="text-3xl font-bold text-zinc-950 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  {metric.value}
                </Link>
              ) : (
                <span className="text-3xl font-bold text-zinc-950">{metric.value}</span>
              )}
              {metric.suffix && <span className="pb-1 text-sm text-zinc-500">{metric.suffix}</span>}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4 rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MusicIcon className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-semibold text-zinc-950">额度使用</h2>
          </div>
          <UsageMeter label="保存乐谱" used={scoreStats.total} limit={entitlements.privateScoreLimit} unit="首" />
          <UsageMeter label="公开乐谱" used={scoreStats.public} limit={entitlements.publicScoreLimit} unit="首" />
          <UsageMeter label="今日导出" used={usage.exportCountToday} limit={entitlements.dailyExportLimit} unit="次" />
        </div>

        <PlanStatusCard entitlements={entitlements} />
      </section>

      <section className="rounded-md border border-emerald-200 bg-[#f3fbf6] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-800">公开奖励</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">公开优质乐谱，获得 Plus 体验</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-700">
              本月已获得 {rewardProgress.rewardDaysThisMonth} / 7 天 Plus 体验，还可继续获得 {rewardProgress.rewardDaysRemaining} 天。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/protected/me/scores">管理公开状态</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
