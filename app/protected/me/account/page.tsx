import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PlanStatusCard } from '@/components/personal/PlanStatusCard';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCnyFromCents } from '@/lib/billing/plans';
import { formatDateTime, getPersonalCenterData } from '@/lib/personal-center';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: '账户与订单 - Ocarinana',
  description: '查看账户信息、订单记录和数据管理入口',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MeAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const { entitlements, recentOrders } = await getPersonalCenterData(user.id, { supabase, user });

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-zinc-500">账户信息</p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-950">{user.email || '未绑定邮箱'}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">用户 ID</dt>
              <dd className="min-w-0 flex-1 text-right">
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        aria-label={`用户 ID：${user.id}`}
                        className="inline-block max-w-full truncate rounded-sm bg-zinc-50 px-2 py-1 font-mono text-xs font-medium text-zinc-950 ring-1 ring-zinc-200 sm:max-w-72"
                        tabIndex={0}
                        title={user.id}
                      >
                        {user.id}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[min(90vw,36rem)] break-all font-mono leading-5" side="top">
                      {user.id}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">注册时间</dt>
              <dd className="font-medium text-zinc-950">{formatDateTime(user.created_at)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">最近登录</dt>
              <dd className="font-medium text-zinc-950">{formatDateTime(user.last_sign_in_at)}</dd>
            </div>
          </dl>
        </div>

        <PlanStatusCard entitlements={entitlements} />
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-500">订单</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">最近支付记录</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/protected/me/plus">Plus 权益</Link>
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">订单</th>
                <th className="py-3 pr-4 font-semibold">金额</th>
                <th className="py-3 pr-4 font-semibold">状态</th>
                <th className="py-3 pr-4 font-semibold">创建时间</th>
                <th className="py-3 pr-4 font-semibold">付款时间</th>
                <th className="py-3 pr-4 font-semibold">权益截止</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 text-zinc-950">{order.plan_name}</td>
                    <td className="py-3 pr-4 text-zinc-600">¥{formatCnyFromCents(order.amount_cents || 0)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.created_at)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.paid_at)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.subscription_period_end)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    暂无订单。
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
