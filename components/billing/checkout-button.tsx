"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingButtonContent } from '@/components/loading-button-content';
import type { BillingPlan } from '@/lib/billing/plans';
import type { ZpayPaymentType } from '@/lib/billing/zpay';

interface CheckoutButtonProps {
  planId: BillingPlan['id'];
  paymentType: ZpayPaymentType;
  children: React.ReactNode;
}

export function CheckoutButton({ planId, paymentType, children }: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
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
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" className="h-11 w-full" onClick={handleCheckout} disabled={isLoading}>
        <LoadingButtonContent loading={isLoading} loadingText="正在创建订单...">
          {children}
        </LoadingButtonContent>
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
