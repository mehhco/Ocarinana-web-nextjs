import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { Button } from '@/components/ui/button';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import { getBillingAccess } from '@/lib/billing/access';
import { getCurrentSubscription } from '@/lib/billing/orders';
import { getDefaultBillingPlan, formatCnyFromCents } from '@/lib/billing/plans';
import { createClient } from '@/lib/supabase/server';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '尚未开通';

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));
}

function isSubscriptionActive(currentPeriodEnd: string | null | undefined) {
  return Boolean(currentPeriodEnd && new Date(currentPeriodEnd).getTime() > Date.now());
}

export default async function BillingPage() {
  const access = await getBillingAccess();
  if (!access.user) {
    redirect('/auth/login');
  }

  if (!access.billingEnabled || !access.isTester) {
    notFound();
  }

  const plan = getDefaultBillingPlan();
  const supabase = await createClient();
  const [subscription, recentOrdersResult] = await Promise.all([
    getCurrentSubscription(access.user.id),
    supabase
      .from('billing_orders')
      .select('id, plan_name, amount_cents, payment_type, status, paid_at, created_at, subscription_period_end')
      .eq('user_id', access.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const recentOrders = recentOrdersResult.data || [];
  const active = isSubscriptionActive(subscription?.current_period_end);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 py-4">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-800">内部灰度订阅</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 md:text-4xl">
            验证 Ocarinana 会员收款链路
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            当前页面仅对灰度用户开放，用于验证 ZPAY 下单、支付回调、订阅入账和状态展示。正式会员权益会在链路稳定后再单独设计。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              '服务端签名下单',
              '异步通知入账',
              '重复回调幂等',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm text-zinc-700">
                <CheckIcon className="h-4 w-4 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-500">当前权益</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-950">
                {active ? '内测会员已开通' : '尚未开通'}
              </h2>
            </div>
            <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {active ? 'active' : 'inactive'}
            </span>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">有效期至</dt>
              <dd className="font-medium text-zinc-950">
                {formatDateTime(subscription?.current_period_end)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">账号</dt>
              <dd className="max-w-48 truncate font-medium text-zinc-950">{access.user.email}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-800">{plan.name}</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-zinc-950">
              ¥{formatCnyFromCents(plan.amountCents)}
            </span>
            <span className="pb-1 text-sm text-zinc-500">/ {plan.durationDays} 天</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            内部灰度价格仅用于打通支付链路。付款完成后，以 ZPAY 异步通知为准自动开通或延长 30 天。
          </p>

          <div className="mt-6 grid gap-3">
            <CheckoutButton paymentType="alipay">支付宝支付</CheckoutButton>
            <CheckoutButton paymentType="wxpay">微信支付</CheckoutButton>
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-1 h-5 w-5 flex-none text-emerald-800" />
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">灰度测试注意事项</h2>
              <div className="mt-3 grid gap-3 text-sm leading-7 text-zinc-600 md:grid-cols-2">
                <p>返回页面不直接开通权益，必须等待 ZPAY notify 回调验签成功。</p>
                <p>如果支付后状态长时间未更新，请用订单号在 ZPAY 后台和 billing_events 表中核对。</p>
                <p>关闭 billing_enabled 后不能创建新订单，但已支付订单回调仍应正常入账。</p>
                <p>正式收费前需要补齐服务协议、退款说明、价格策略和会员权益定义。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-500">最近订单</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">支付链路记录</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/protected/editor/v2/new">返回创作</Link>
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
                    <td className="py-3 pr-4 text-zinc-600">{order.payment_type}</td>
                    <td className="py-3 pr-4 text-zinc-600">¥{formatCnyFromCents(order.amount_cents)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.created_at)}</td>
                    <td className="py-3 pr-4 text-zinc-600">
                      {formatDateTime(order.subscription_period_end)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    暂无订单。完成一次内测支付后，这里会显示链路结果。
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
