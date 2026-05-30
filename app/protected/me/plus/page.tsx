import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { PlanStatusCard } from '@/components/personal/PlanStatusCard';
import { UsageMeter } from '@/components/personal/UsageMeter';
import { Button } from '@/components/ui/button';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import { formatCnyFromCents, getBillingPlans } from '@/lib/billing/plans';
import { formatDateTime, getPersonalCenterData } from '@/lib/personal-center';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Plus 权益 - Ocarinana',
  description: '查看当前权益、额度使用、Plus 方案和订单记录',
  robots: {
    index: false,
    follow: false,
  },
};

type PlusPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const plusFeatures = [
  '最多保存 100 首私有乐谱',
  '每日 100 次高清导出',
  '无水印导出',
  '包含全部基础创作能力',
  '优先体验新功能',
];

const freeFeatures = [
  '基础编辑器',
  '最多保存 5 首私有乐谱',
  '公开乐谱无上限',
  '每日 3 次导出',
  '访问乐谱广场和音乐课堂',
];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getReasonNotice(reason: string | undefined) {
  if (reason === 'score-limit') {
    return {
      title: '你遇到了保存额度限制',
      description: '免费版最多保存 5 首私有乐谱。公开乐谱不受数量限制；升级 Plus 后可保存 100 首，并获得更高导出额度。',
    };
  }

  if (reason === 'export-limit') {
    return {
      title: '你遇到了每日导出限制',
      description: '免费版每日可导出 3 次。升级 Plus 后每日可导出 100 次，并支持无水印导出。',
    };
  }

  return null;
}

export default async function MePlusPage({ searchParams }: PlusPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const reasonNotice = getReasonNotice(getSingleParam(resolvedSearchParams.reason));
  const { access, entitlements, scoreStats, usage, recentOrders, rewardProgress } =
    await getPersonalCenterData(user.id, { supabase, user });
  const plans = getBillingPlans();
  const canCheckout = access.billingEnabled && access.isTester;

  return (
    <div className="space-y-8">
      {reasonNotice && (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
            <div>
              <h2 className="font-semibold text-amber-950">{reasonNotice.title}</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">{reasonNotice.description}</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <PlanStatusCard entitlements={entitlements} />

        <div className="space-y-4 rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">额度使用</h2>
          <UsageMeter label="保存乐谱" used={scoreStats.total} limit={entitlements.privateScoreLimit} unit="首" />
          <UsageMeter label="公开乐谱" used={scoreStats.public} limit={entitlements.publicScoreLimit} unit="首" />
          <UsageMeter label="今日导出" used={usage.exportCountToday} limit={entitlements.dailyExportLimit} unit="次" />
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <p className="text-xs font-semibold text-emerald-800">Ocarinana Plus</p>
          <h2 className="text-base font-semibold tracking-normal text-zinc-950">
            为持续创作准备的陶笛谱会员
          </h2>
          <p className="text-xs leading-5 text-zinc-500 md:border-l md:border-zinc-200 md:pl-3">
            免费版保留完整入门体验和无限公开。Plus 适合需要更多保存空间、无水印导出和高频导出的用户。
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={[
              'flex flex-col rounded-md border bg-white p-6 shadow-sm',
              plan.recommended ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-zinc-200',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-800">{plan.name}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold text-zinc-950">
                    ¥{formatCnyFromCents(plan.amountCents)}
                  </span>
                  <span className="pb-1 text-sm text-zinc-500">/ {plan.durationDays} 天</span>
                </div>
              </div>
              {plan.badge && (
                <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="mt-4 min-h-14 text-sm leading-7 text-zinc-600">{plan.description}</p>
            <div className="mt-6">
              {canCheckout ? (
                <CheckoutButton planId={plan.id} paymentType="alipay">支付宝支付</CheckoutButton>
              ) : (
                <Button className="h-11 w-full" disabled>
                  暂未开放购买
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">免费版</h2>
          <ul className="mt-4 space-y-3">
            {freeFeatures.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-zinc-600">
                <CheckIcon className="mt-1 h-4 w-4 flex-none text-zinc-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-emerald-200 bg-[#f3fbf6] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Plus 会员</h2>
          <ul className="mt-4 space-y-3">
            {plusFeatures.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-zinc-700">
                <CheckIcon className="mt-1 h-4 w-4 flex-none text-emerald-700" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-1 h-5 w-5 flex-none text-emerald-800" />
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">付款和续费说明</h2>
            <ul className="mt-3 grid gap-3 text-sm leading-7 text-zinc-600 md:grid-cols-2">
              {[
                '当前支持支付宝付款，支付完成后会自动开通权益。',
                'Plus 是有效期会员，不是自动续费；到期前续费会从当前到期日继续累加。',
                '到期后不会删除已有乐谱，公开乐谱也不会受限；超出免费保存或导出额度时会限制新建和会员导出能力。',
                '如果支付后状态长时间未更新，请到“账户与订单”查看最近订单。',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckIcon className="mt-1.5 h-4 w-4 flex-none text-emerald-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-800">分享奖励</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">公开优质乐谱，获得 Plus 体验</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              将自己制作的完整乐谱公开到乐谱广场，系统通过基础质量检查后可获得 1 天 Plus 体验。
              每首乐谱只奖励一次，本月最多可获得 7 天。
            </p>
          </div>
          <div className="rounded-md border border-emerald-100 bg-[#f3fbf6] p-5">
            <p className="text-sm font-semibold text-zinc-600">本月奖励进度</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-800">
                {rewardProgress.rewardDaysThisMonth}
              </span>
              <span className="pb-1 text-sm text-zinc-500">/ 7 天</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              还可通过公开优质乐谱获得 {rewardProgress.rewardDaysRemaining} 天 Plus 体验。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-500">最近订单</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">支付记录</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/protected/me/account">查看账户与订单</Link>
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">订单</th>
                <th className="py-3 pr-4 font-semibold">方式</th>
                <th className="py-3 pr-4 font-semibold">金额</th>
                <th className="py-3 pr-4 font-semibold">状态</th>
                <th className="py-3 pr-4 font-semibold">创建时间</th>
                <th className="py-3 pr-4 font-semibold">权益截止</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 text-zinc-950">{order.plan_name}</td>
                    <td className="py-3 pr-4 text-zinc-600">支付宝</td>
                    <td className="py-3 pr-4 text-zinc-600">¥{formatCnyFromCents(order.amount_cents || 0)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.created_at)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.subscription_period_end)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    暂无订单。完成一次支付后，这里会显示购买结果。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
