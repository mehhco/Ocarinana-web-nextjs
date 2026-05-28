import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ZpayAutoSubmitForm } from '@/components/billing/zpay-auto-submit-form';
import { Button } from '@/components/ui/button';
import { createZpaySubmitParams } from '@/lib/billing/zpay';
import { formatCnyFromCents } from '@/lib/billing/plans';
import { getBillingAccess } from '@/lib/billing/access';
import { getUserBillingOrder } from '@/lib/billing/orders';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  return headers().then((headersList) => {
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  });
}

export default async function BillingCheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const access = await getBillingAccess();
  if (!access.user) {
    redirect('/auth/login');
  }

  const { orderId } = await params;
  const order = await getUserBillingOrder(orderId, access.user.id);
  if (!order) {
    notFound();
  }

  if (order.status !== 'pending') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        <div className="w-full rounded-md border border-zinc-200 bg-white p-6">
          <p className="text-sm font-semibold text-emerald-800">订单状态</p>
          <h1 className="mt-3 text-2xl font-bold text-zinc-950">该订单无需继续支付</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">当前状态：{order.status}</p>
          <Button asChild className="mt-6">
            <Link href="/protected/me/plus">返回 Plus 权益</Link>
          </Button>
        </div>
      </div>
    );
  }

  const baseUrl = await getBaseUrl();
  const submitParams = createZpaySubmitParams({
    type: order.payment_type,
    outTradeNo: order.out_trade_no,
    notifyUrl: `${baseUrl}/api/billing/zpay/notify`,
    returnUrl: `${baseUrl}/protected/billing/return`,
    name: order.plan_name,
    money: formatCnyFromCents(order.amount_cents),
    param: order.zpay_param || order.out_trade_no,
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
      <div className="w-full rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-800">安全跳转</p>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950">正在前往 ZPAY 收银台</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          订单已创建，浏览器会自动提交到 ZPAY。请在支付页面核对金额
          ¥{formatCnyFromCents(order.amount_cents)} 和订单名称。
        </p>
        <ZpayAutoSubmitForm params={submitParams} />
      </div>
    </div>
  );
}
