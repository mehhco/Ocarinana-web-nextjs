import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRightIcon,
  CheckIcon,
  EyeIcon,
  MusicIcon,
  SparklesIcon,
} from '@/components/ui/icons';
import {
  getAdminDashboardData,
  type AdminDailyTrendPoint,
  type AdminDashboardSummary,
} from '@/lib/admin/dashboard';
import { formatCnyFromCents } from '@/lib/billing/plans';
import { formatDateTime } from '@/lib/personal-center';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '后台 - Ocarinana',
  description: '查看 Ocarinana 用户、乐谱、会员和订单关键数据',
  robots: {
    index: false,
    follow: false,
  },
};

function formatInteger(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatMoney(amountCents: number) {
  return `¥${formatCnyFromCents(amountCents)}`;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMonthDay(value: string) {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

function formatUserLabel(email: string | null, userId: string) {
  return email || `用户 ${userId.slice(0, 8)}`;
}

function paymentTypeLabel(value: string) {
  if (value === 'alipay') return '支付宝';
  if (value === 'wxpay') return '微信';
  return value;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'paid' || status === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status === 'pending'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : status === 'failed' || status === 'closed'
          ? 'border-rose-200 bg-rose-50 text-rose-800'
          : 'border-zinc-200 bg-zinc-50 text-zinc-700';

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isPublic
          ? 'border-sky-200 bg-sky-50 text-sky-800'
          : 'border-zinc-200 bg-zinc-50 text-zinc-700'
      }
    >
      {isPublic ? '公开' : '私有'}
    </Badge>
  );
}

function MetricCard({
  description,
  icon,
  label,
  value,
}: {
  description: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-emerald-700">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-normal text-zinc-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </article>
  );
}

function getTrendStats(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const latest = values.at(-1) || 0;
  const peak = values.length > 0 ? Math.max(...values) : 0;

  return { latest, peak, total };
}

function getLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return '';
  }

  const maxValue = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function TrendLineChart({
  accentClassName,
  description,
  formatValue = formatInteger,
  title,
  values,
}: {
  accentClassName: string;
  description: string;
  formatValue?: (value: number) => string;
  title: string;
  values: number[];
}) {
  const chartWidth = 320;
  const chartHeight = 112;
  const stats = getTrendStats(values);
  const path = getLinePath(values, chartWidth, chartHeight);
  const areaPath = path ? `${path} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : '';

  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-950">{formatValue(stats.total)}</div>
          <div className="mt-1 text-xs text-zinc-500">30 天合计</div>
        </div>
      </div>

      <div className="mt-5 h-36 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3">
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img">
          <title>{title}</title>
          <path d={areaPath} className="fill-emerald-100/70" />
          <path d={path} className={accentClassName} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          {values.map((value, index) => {
            const maxValue = Math.max(...values, 1);
            const x = values.length > 1 ? (index * chartWidth) / (values.length - 1) : chartWidth;
            const y = chartHeight - (value / maxValue) * chartHeight;

            return index === values.length - 1 ? (
              <circle key={`${index}-${value}`} cx={x} cy={y} r="4" className={accentClassName.replace('stroke-', 'fill-')} />
            ) : null;
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <div className="text-xs text-zinc-500">最近一天</div>
          <div className="mt-1 font-semibold text-zinc-950">{formatValue(stats.latest)}</div>
        </div>
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <div className="text-xs text-zinc-500">单日峰值</div>
          <div className="mt-1 font-semibold text-zinc-950">{formatValue(stats.peak)}</div>
        </div>
      </div>
    </article>
  );
}

function TrendBarChart({
  description,
  formatValue = formatInteger,
  title,
  values,
}: {
  description: string;
  formatValue?: (value: number) => string;
  title: string;
  values: number[];
}) {
  const stats = getTrendStats(values);
  const maxValue = Math.max(...values, 1);

  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-950">{formatValue(stats.total)}</div>
          <div className="mt-1 text-xs text-zinc-500">30 天合计</div>
        </div>
      </div>

      <div className="mt-5 flex h-36 items-end gap-1 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3">
        {values.map((value, index) => {
          const height = Math.max((value / maxValue) * 100, value > 0 ? 8 : 2);

          return (
            <div
              key={`${index}-${value}`}
              className="min-w-0 flex-1 rounded-t-sm bg-emerald-600/80"
              style={{ height: `${height}%` }}
              title={`${formatValue(value)}`}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <div className="text-xs text-zinc-500">最近一天</div>
          <div className="mt-1 font-semibold text-zinc-950">{formatValue(stats.latest)}</div>
        </div>
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <div className="text-xs text-zinc-500">单日峰值</div>
          <div className="mt-1 font-semibold text-zinc-950">{formatValue(stats.peak)}</div>
        </div>
      </div>
    </article>
  );
}

function TrendOverview({ trends }: { trends: AdminDailyTrendPoint[] }) {
  const labels = trends.map((point) => formatMonthDay(point.date));
  const startLabel = labels[0] || '最近';
  const endLabel = labels.at(-1) || '今天';

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">趋势</p>
          <h2 className="mt-1 text-xl font-bold text-zinc-950">最近 30 天变化</h2>
        </div>
        <p className="text-sm text-zinc-500">{startLabel} - {endLabel}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendLineChart
          accentClassName="stroke-emerald-700"
          description="按注册日期统计，用于判断新增用户节奏。"
          title="新增用户"
          values={trends.map((point) => point.newUsers)}
        />
        <TrendLineChart
          accentClassName="stroke-sky-700"
          description="按乐谱创建日期统计，反映创作活跃度。"
          title="新建乐谱"
          values={trends.map((point) => point.newScores)}
        />
        <TrendBarChart
          description="按 published_at 统计，观察乐谱广场内容供给。"
          title="公开乐谱"
          values={trends.map((point) => point.publishedScores)}
        />
        <TrendBarChart
          description="按 paid_at 统计 paid 订单金额，单位为元。"
          formatValue={(value) => `¥${formatCompact(value / 100)}`}
          title="支付收入"
          values={trends.map((point) => point.paidAmountCents)}
        />
      </div>
    </section>
  );
}

function DataSection({
  children,
  description,
  minWidth = '760px',
  title,
}: {
  children: ReactNode;
  description: string;
  minWidth?: string;
  title: string;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </section>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 text-center text-zinc-500">
        暂无数据。
      </td>
    </tr>
  );
}

function UserCell({ email, userId }: { email: string | null; userId: string }) {
  return (
    <div className="min-w-0">
      <div className="max-w-56 truncate font-medium text-zinc-950" title={email || userId}>
        {formatUserLabel(email, userId)}
      </div>
      <div className="mt-1 max-w-56 truncate font-mono text-xs text-zinc-400" title={userId}>
        {userId}
      </div>
    </div>
  );
}

function OrderStatusStrip({ summary }: { summary: AdminDashboardSummary }) {
  const items = [
    { label: '待支付', value: summary.pendingOrders, className: 'bg-amber-500' },
    { label: '已支付', value: summary.paidOrders, className: 'bg-emerald-600' },
    { label: '失败', value: summary.failedOrders, className: 'bg-rose-500' },
    { label: '关闭', value: summary.closedOrders, className: 'bg-zinc-400' },
  ];

  return (
    <section className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500">订单状态</p>
          <h2 className="mt-2 text-xl font-bold text-zinc-950">
            已支付 {formatInteger(summary.paidOrders)} 笔，近 7 天 {formatInteger(summary.paidOrders7d)} 笔
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[520px]">
          {items.map((item) => (
            <div key={item.label} className="rounded-md border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
                <span className="text-xs font-medium text-zinc-500">{item.label}</span>
              </div>
              <div className="mt-2 text-xl font-bold text-zinc-950">{formatInteger(item.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  const { activeSubscriptions, dailyTrends, recentOrders, recentScores, recentUsers, summary } = data;

  const metrics = [
    {
      label: '用户总数',
      value: formatInteger(summary.totalUsers),
      description: `近 7 天新增 ${formatInteger(summary.newUsers7d)} 个用户`,
      icon: <EyeIcon className="h-5 w-5" />,
    },
    {
      label: '乐谱总数',
      value: formatInteger(summary.totalScores),
      description: `${formatInteger(summary.publicScores)} 首公开，${formatInteger(summary.privateScores)} 首私有`,
      icon: <MusicIcon className="h-5 w-5" />,
    },
    {
      label: '有效 Plus',
      value: formatInteger(summary.activeSubscriptions),
      description: '当前 active 且未过期的会员权益',
      icon: <SparklesIcon className="h-5 w-5" />,
    },
    {
      label: '已支付金额',
      value: formatMoney(summary.paidAmountCents),
      description: '按 paid 订单金额快照汇总',
      icon: <CheckIcon className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <OrderStatusStrip summary={summary} />

      <TrendOverview trends={dailyTrends} />

      <div className="grid gap-6 xl:grid-cols-2">
        <DataSection title="最近用户" description="来自 Supabase Auth 的最近注册账号。">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-3 pr-4 font-semibold">用户</th>
              <th className="py-3 pr-4 font-semibold">注册时间</th>
              <th className="py-3 pr-4 font-semibold">最近登录</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4"><UserCell email={user.email} userId={user.id} /></td>
                  <td className="py-3 pr-4 text-zinc-600">{formatDateTime(user.createdAt)}</td>
                  <td className="py-3 pr-4 text-zinc-600">{formatDateTime(user.lastSignInAt)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={3} />
            )}
          </tbody>
        </DataSection>

        <DataSection title="有效会员" description="active 且权益截止时间晚于当前时间的订阅。">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-3 pr-4 font-semibold">用户</th>
              <th className="py-3 pr-4 font-semibold">套餐</th>
              <th className="py-3 pr-4 font-semibold">状态</th>
              <th className="py-3 pr-4 font-semibold">截止时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {activeSubscriptions.length > 0 ? (
              activeSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="py-3 pr-4">
                    <UserCell email={subscription.userEmail} userId={subscription.userId} />
                  </td>
                  <td className="py-3 pr-4 text-zinc-600">{subscription.planId}</td>
                  <td className="py-3 pr-4"><StatusBadge status={subscription.status} /></td>
                  <td className="py-3 pr-4 text-zinc-600">{formatDateTime(subscription.currentPeriodEnd)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={4} />
            )}
          </tbody>
        </DataSection>
      </div>

      <DataSection title="最近订单" description="不展示支付回调原始 payload，仅展示排查所需订单摘要。" minWidth="980px">
        <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
          <tr>
            <th className="py-3 pr-4 font-semibold">订单</th>
            <th className="py-3 pr-4 font-semibold">用户</th>
            <th className="py-3 pr-4 font-semibold">金额</th>
            <th className="py-3 pr-4 font-semibold">支付方式</th>
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
                <td className="py-3 pr-4">
                  <div className="font-medium text-zinc-950">{order.planName}</div>
                  <div className="mt-1 max-w-48 truncate font-mono text-xs text-zinc-400" title={order.outTradeNo}>
                    {order.outTradeNo}
                  </div>
                </td>
                <td className="py-3 pr-4"><UserCell email={order.userEmail} userId={order.userId} /></td>
                <td className="py-3 pr-4 font-medium text-zinc-950">{formatMoney(order.amountCents)}</td>
                <td className="py-3 pr-4 text-zinc-600">{paymentTypeLabel(order.paymentType)}</td>
                <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.createdAt)}</td>
                <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.paidAt)}</td>
                <td className="py-3 pr-4 text-zinc-600">{formatDateTime(order.subscriptionPeriodEnd)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={8} />
          )}
        </tbody>
      </DataSection>

      <DataSection title="最近乐谱" description="按更新时间排序，包含公开状态和作者摘要。" minWidth="920px">
        <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
          <tr>
            <th className="py-3 pr-4 font-semibold">乐谱</th>
            <th className="py-3 pr-4 font-semibold">作者</th>
            <th className="py-3 pr-4 font-semibold">状态</th>
            <th className="py-3 pr-4 font-semibold">更新时间</th>
            <th className="py-3 pr-4 font-semibold">公开时间</th>
            <th className="py-3 pr-4 font-semibold">入口</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {recentScores.length > 0 ? (
            recentScores.map((score) => (
              <tr key={score.scoreId}>
                <td className="py-3 pr-4">
                  <div className="max-w-64 truncate font-medium text-zinc-950" title={score.title}>
                    {score.title}
                  </div>
                  <div className="mt-1 max-w-48 truncate font-mono text-xs text-zinc-400" title={score.scoreId}>
                    {score.scoreId}
                  </div>
                </td>
                <td className="py-3 pr-4"><UserCell email={score.ownerEmail} userId={score.ownerUserId} /></td>
                <td className="py-3 pr-4"><VisibilityBadge isPublic={score.isPublic} /></td>
                <td className="py-3 pr-4 text-zinc-600">{formatDateTime(score.updatedAt)}</td>
                <td className="py-3 pr-4 text-zinc-600">{formatDateTime(score.publishedAt)}</td>
                <td className="py-3 pr-4">
                  {score.isPublic ? (
                    <a
                      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
                      href={`/scores/${score.scoreId}`}
                    >
                      查看
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-zinc-400">私有</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6} />
          )}
        </tbody>
      </DataSection>
    </>
  );
}
