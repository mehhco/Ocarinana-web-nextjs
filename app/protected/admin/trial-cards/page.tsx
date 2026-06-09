import type { Metadata } from 'next';
import { createTrialCardAction, deactivateTrialCardAction } from '@/app/protected/admin/trial-cards/actions';
import { PendingSubmitButton } from '@/components/pending-submit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAdminTrialCards, type AdminTrialCard } from '@/lib/admin/trial-cards';
import { formatDateTime } from '@/lib/personal-center';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '体验卡 - 后台 - Ocarinana',
  description: '后台生成和管理 Plus 体验卡',
  robots: {
    index: false,
    follow: false,
  },
};

type TrialCardsPageProps = {
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

function TrialCardStatusBadge({ card }: { card: AdminTrialCard }) {
  const expired = new Date(card.expiresAt).getTime() <= Date.now();
  const full = card.claimedCount >= card.maxRedemptions;

  if (!card.active) {
    return <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-700">已停用</Badge>;
  }

  if (expired) {
    return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">已过期</Badge>;
  }

  if (full) {
    return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">已领完</Badge>;
  }

  return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">可领取</Badge>;
}

function formatUserLabel(email: string | null, userId: string) {
  return email || `用户 ${userId.slice(0, 8)}`;
}

export default async function AdminTrialCardsPage({ searchParams }: TrialCardsPageProps) {
  const params = await searchParams;
  const successMessage = getParam(params, 'success');
  const errorMessage = getParam(params, 'error');
  const createdCode = getParam(params, 'createdCode');
  const defaultExpiresAt = toShanghaiDateTimeInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const trialCards = await getAdminTrialCards();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-emerald-800">营销体验</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">生成 Plus 体验卡</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              一个兑换码可配置多人领取上限、体验天数和过期时间。用户在 Plus 页面兑换后会顺延当前会员权益。
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <MessageBanner type="success" message={successMessage} />
            <MessageBanner type="error" message={errorMessage} />
            {createdCode && (
              <div className="rounded-md border border-emerald-200 bg-[#f3fbf6] p-4">
                <p className="text-xs font-semibold text-emerald-800">新体验卡编号</p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-950">{createdCode}</p>
              </div>
            )}
          </div>

          <form action={createTrialCardAction} className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxRedemptions">可领取数量</Label>
                <Input
                  id="maxRedemptions"
                  name="maxRedemptions"
                  type="number"
                  min={1}
                  max={100000}
                  defaultValue={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationDays">体验时长（天）</Label>
                <Input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={7}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">过期时间（北京时间）</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                defaultValue={defaultExpiresAt}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">备注</Label>
              <textarea
                id="note"
                name="note"
                className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="例如：6 月小红书投放、线下活动扫码领取"
              />
            </div>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
              生成后不支持修改参数；若活动结束或兑换码泄露，可在列表中停用。
            </div>

            <PendingSubmitButton loadingText="生成中...">
              生成体验卡
            </PendingSubmitButton>
          </form>
        </div>

        <div className="rounded-md border border-emerald-200 bg-[#f3fbf6] p-5">
          <p className="text-sm font-semibold text-emerald-800">兑换规则</p>
          <h2 className="mt-2 text-xl font-bold text-zinc-950">同一码每人一次</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
            <p>体验卡使用 UUID 风格编号，适合直接放入宣传物料或客服消息。</p>
            <p>兑换成功会写入体验卡流水，并将用户当前 Plus 权益顺延。</p>
            <p>体验卡不会创建支付订单，也不会写入任何支付回调原始数据。</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-950">最近体验卡</h2>
          <p className="mt-1 text-sm text-zinc-500">按创建时间倒序展示最近 30 张，每张展示最近 5 条兑换记录。</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">编号</th>
                <th className="py-3 pr-4 font-semibold">状态</th>
                <th className="py-3 pr-4 font-semibold">领取进度</th>
                <th className="py-3 pr-4 font-semibold">体验天数</th>
                <th className="py-3 pr-4 font-semibold">过期时间</th>
                <th className="py-3 pr-4 font-semibold">最近兑换</th>
                <th className="py-3 pr-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {trialCards.length > 0 ? (
                trialCards.map((card) => (
                  <tr key={card.id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="max-w-72 break-all font-mono text-xs font-semibold text-zinc-950">
                        {card.code}
                      </div>
                      {card.note && (
                        <div className="mt-2 max-w-72 text-xs leading-5 text-zinc-500">{card.note}</div>
                      )}
                      <div className="mt-2 text-xs text-zinc-400">创建：{formatDateTime(card.createdAt)}</div>
                    </td>
                    <td className="py-3 pr-4"><TrialCardStatusBadge card={card} /></td>
                    <td className="py-3 pr-4 text-zinc-600">
                      <span className="font-semibold text-zinc-950">{card.claimedCount}</span>
                      <span className="text-zinc-400"> / {card.maxRedemptions}</span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{card.durationDays} 天</td>
                    <td className="py-3 pr-4 text-zinc-600">{formatDateTime(card.expiresAt)}</td>
                    <td className="py-3 pr-4">
                      {card.recentRedemptions.length > 0 ? (
                        <div className="space-y-2">
                          {card.recentRedemptions.map((redemption) => (
                            <div key={redemption.id} className="text-xs leading-5">
                              <div className="font-medium text-zinc-800">
                                {formatUserLabel(redemption.userEmail, redemption.userId)}
                              </div>
                              <div className="font-mono text-zinc-400">{redemption.userId}</div>
                              <div className="text-zinc-500">{formatDateTime(redemption.redeemedAt)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400">暂无兑换</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {card.active ? (
                        <form action={deactivateTrialCardAction}>
                          <input type="hidden" name="cardId" value={card.id} />
                          <Button type="submit" variant="outline" size="sm">
                            停用
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-zinc-400">已停用</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    暂无体验卡。
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
