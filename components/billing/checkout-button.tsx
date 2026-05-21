"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BILLING_PLAN_ID } from '@/lib/billing/plans';
import type { ZpayPaymentType } from '@/lib/billing/zpay';

interface CheckoutButtonProps {
  paymentType: ZpayPaymentType;
  children: React.ReactNode;
}

export function CheckoutButton({ paymentType, children }: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: BILLING_PLAN_ID,
          paymentType,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || '无法创建支付订单');
      }

      router.push(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : '无法创建支付订单');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" className="h-11 w-full" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? '正在创建订单' : children}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
