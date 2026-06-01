import Link from 'next/link';
import { Mail, MessageCircle, ReceiptText } from 'lucide-react';

type OrderSupportContactProps = {
  orderId?: string | null;
  outTradeNo?: string | null;
  userEmail?: string | null;
  compact?: boolean;
};

function createSupportMailto(orderId?: string | null, outTradeNo?: string | null, userEmail?: string | null) {
  const subject = orderId ? `Ocarinana 订单问题反馈 - ${orderId}` : 'Ocarinana 订单问题反馈';
  const body = [
    '请描述你遇到的订单问题：',
    '',
    `订单 ID：${orderId || '请填写订单 ID'}`,
    `商户订单号：${outTradeNo || '如有请填写'}`,
    `登录邮箱：${userEmail || '请填写登录邮箱'}`,
    '支付方式：支付宝 / 微信 / 其他',
    '支付时间：',
    '支付金额：',
    '',
    '建议附上：支付成功截图、平台交易号、页面错误截图或录屏。',
  ].join('\n');

  return `mailto:mehhco@163.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function OrderSupportContact({
  orderId,
  outTradeNo,
  userEmail,
  compact = false,
}: OrderSupportContactProps) {
  const mailto = createSupportMailto(orderId, outTradeNo, userEmail);

  return (
    <section className="rounded-md border border-amber-200 bg-[#fffaf0] p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-amber-700" />
            <p className="text-sm font-semibold text-amber-900">订单问题反馈</p>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-normal text-zinc-950">
            支付后权益未更新，或订单状态异常？
          </h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600">
            联系时请带上订单 ID、支付截图、支付时间、支付金额和登录邮箱。信息越完整，越容易核对支付平台和站内订单状态。
          </p>
          {!compact && (
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-zinc-600 md:grid-cols-2">
              <li className="rounded-sm bg-white/70 px-3 py-2 ring-1 ring-amber-900/10">订单 ID：{orderId || '账户与订单页可查看'}</li>
              <li className="rounded-sm bg-white/70 px-3 py-2 ring-1 ring-amber-900/10">支付凭证：支付成功截图或平台交易号</li>
              <li className="rounded-sm bg-white/70 px-3 py-2 ring-1 ring-amber-900/10">账号信息：登录邮箱 {userEmail || ''}</li>
              <li className="rounded-sm bg-white/70 px-3 py-2 ring-1 ring-amber-900/10">问题现象：权益未开通、重复支付或金额异常</li>
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:min-w-56">
          <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold text-zinc-950">
              <MessageCircle className="h-4 w-4 text-emerald-700" />
              微信客服
            </div>
            <p className="mt-2 font-mono text-base font-semibold text-zinc-950">mehhco</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">添加时备注“订单问题”。</p>
          </div>

          <Link
            href={mailto}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:border-emerald-700 hover:text-emerald-800"
          >
            <Mail className="h-4 w-4" />
            邮件反馈
          </Link>
        </div>
      </div>
    </section>
  );
}
