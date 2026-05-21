"use client";

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ZpaySubmitParams } from '@/lib/billing/zpay';

const ZPAY_GATEWAY_URL = 'https://zpayz.cn/submit.php';

interface ZpayAutoSubmitFormProps {
  params: ZpaySubmitParams;
}

export function ZpayAutoSubmitForm({ params }: ZpayAutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} method="POST" action={ZPAY_GATEWAY_URL} className="mt-8 space-y-4">
      {Object.entries(params)
        .filter(([, value]) => typeof value !== 'undefined')
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
      <Button type="submit" className="h-11">
        前往支付
      </Button>
    </form>
  );
}
