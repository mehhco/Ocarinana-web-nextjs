import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OrderStatusPoller } from '@/components/billing/order-status-poller';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

type ReturnSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingReturnPage({
  searchParams,
}: {
  searchParams: ReturnSearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const outTradeNo = getSingleParam(resolvedSearchParams.out_trade_no);

  const { data: order } = outTradeNo
    ? await supabase
        .from('billing_orders')
        .select('id, status, paid_at, subscription_period_end')
        .eq('out_trade_no', outTradeNo)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center">
      <div className="w-full space-y-5">
        <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6">
          <p className="text-sm font-semibold text-emerald-800">支付返回</p>
          <h1 className="mt-3 text-2xl font-bold text-zinc-950">订单确认中</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            权益开通以 ZPAY 异步通知为准。页面返回不直接授予会员权限，避免支付状态被伪造。
          </p>
        </div>

        {order ? (
          <OrderStatusPoller
            orderId={order.id}
            initialStatus={{
              status: order.status,
              paidAt: order.paid_at,
              subscriptionPeriodEnd: order.subscription_period_end,
            }}
          />
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            没有在当前账号下找到这笔订单。请回到订阅页查看最新状态，或在 ZPAY 后台和数据库中人工核对。
          </div>
        )}

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/protected/billing">返回订阅页</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/protected/editor/v2/new">打开编辑器</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
