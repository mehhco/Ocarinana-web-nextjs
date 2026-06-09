import type { Metadata } from 'next';
import { PendingSubmitButton } from '@/components/pending-submit-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setManualMembership } from '@/app/protected/admin/memberships/actions';
import { getAdminMemberships } from '@/lib/admin/memberships';
import { formatDateTime } from '@/lib/personal-center';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '会员权益 - 后台 - Ocarinana',
  description: '后台手动设置用户会员权益',
  robots: {
    index: false,
    follow: false,
  },
};

type MembershipsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function toShanghaiDateTimeInput(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function formatUserLabel(email: string | null, userId: string) {
  return email || `用户 ${userId.slice(0, 8)}`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === 'active'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-zinc-200 bg-zinc-50 text-zinc-700'
      }
    >
      {status}
    </Badge>
  );
}

function MessageBanner({
  message,
  type,
}: {
  message: string | undefined;
  type: 'error' | 'success';
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        type === 'success'
          ? 'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'
          : 'rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800'
      }
    >
      {message}
    </div>
  );
}

export default async function AdminMembershipsPage({ searchParams }: MembershipsPageProps) {
  const params = await searchParams;
  const successMessage = getParam(params, 'success');
  const errorMessage = getParam(params, 'error');
  const presetUserId = getParam(params, 'userId') || '';
  const defaultExpiresAt = toShanghaiDateTimeInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const memberships = await getAdminMemberships();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-emerald-800">手动权益</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">设置用户 Plus 到期时间</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              适用于补偿、人工开通或排查支付异常。提交后会覆盖该用户当前会员截止时间，不会创建支付订单。
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <MessageBanner type="success" message={successMessage} />
            <MessageBanner type="error" message={errorMessage} />
          </div>

          <form action={setManualMembership} className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="userId">用户 UUID</Label>
              <Input
                id="userId"
                name="userId"
                defaultValue={presetUserId}
                placeholder="00000000-0000-0000-0000-000000000000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">会员到期时间（北京时间）</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                defaultValue={defaultExpiresAt}
                required
              />
            </div>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
              套餐标识固定写入 <span className="font-mono font-semibold text-zinc-950">plus_manual_admin</span>。
              用户权益判断仍复用现有 Plus 规则。
            </div>

            <PendingSubmitButton loadingText="设置中...">
              设置会员权益
            </PendingSubmitButton>
          </form>
        </div>

        <div className="rounded-md border border-amber-200 bg-[#fff9ed] p-5">
          <p className="text-sm font-semibold text-amber-800">操作边界</p>
          <h2 className="mt-2 text-xl font-bold text-zinc-950">只修改当前权益</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
            <p>
              这个操作只 upsert <code className="font-mono text-xs text-zinc-950">subscriptions</code> 当前权益行，不改历史订单，也不写支付流水。
            </p>
            <p>如果用户后续正常购买，支付回调仍会按现有逻辑延长同一条当前权益记录。</p>
            <p>撤销或停用会员不在本页处理范围内，后续可以单独增加带确认流程的停用操作。</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-950">当前 active 会员</h2>
          <p className="mt-1 text-sm text-zinc-500">按权益截止时间倒序展示最近 30 条。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">用户</th>
                <th className="py-3 pr-4 font-semibold">套餐</th>
                <th className="py-3 pr-4 font-semibold">状态</th>
                <th className="py-3 pr-4 font-semibold">开始时间</th>
                <th className="py-3 pr-4 font-semibold">到期时间</th>
                <th className="py-3 pr-4 font-semibold">最近更新</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {memberships.length > 0 ? (
                memberships.map((membership) => (
                  <tr key={membership.id}>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-zinc-950">
                        {formatUserLabel(membership.userEmail, membership.userId)}
                      </div>
                      <div className="mt-1 max-w-64 truncate font-mono text-xs text-zinc-400" title={membership.userId}>
                        {membership.userId}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-600">{membership.planId}</td>
                    <td className="py-3 pr-4"><StatusBadge status={membership.status} /></td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(membership.currentPeriodStart)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(membership.currentPeriodEnd)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(membership.updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    暂无 active 会员。
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
