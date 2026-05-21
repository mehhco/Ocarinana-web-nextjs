"use client";

import { useEffect, useState } from 'react';

type OrderStatus = {
  status: string;
  paidAt: string | null;
  subscriptionPeriodEnd: string | null;
};

interface OrderStatusPollerProps {
  orderId: string;
  initialStatus: OrderStatus;
}

function formatDateTime(value: string | null) {
  if (!value) return '等待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));
}

export function OrderStatusPoller({ orderId, initialStatus }: OrderStatusPollerProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status.status !== 'pending') return;

    const intervalId = window.setInterval(async () => {
      const response = await fetch(`/api/billing/orders/${orderId}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;

      const payload = await response.json();
      setStatus({
        status: payload.status,
        paidAt: payload.paidAt,
        subscriptionPeriodEnd: payload.subscriptionPeriodEnd,
      });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [orderId, status.status]);

  const isPaid = status.status === 'paid';

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-950">
            {isPaid ? '支付已确认' : '等待支付确认'}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {isPaid
              ? `会员有效期至 ${formatDateTime(status.subscriptionPeriodEnd)}`
              : '如果已经完成支付，请稍等几秒，系统正在等待 ZPAY 异步通知。'}
          </p>
        </div>
        <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
          {status.status}
        </span>
      </div>
      <p className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
        支付时间：{formatDateTime(status.paidAt)}
      </p>
    </div>
  );
}
