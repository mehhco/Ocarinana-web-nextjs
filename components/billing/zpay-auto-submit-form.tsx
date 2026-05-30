"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingButtonContent } from '@/components/loading-button-content';
import type { ZpaySubmitParams } from '@/lib/billing/zpay';

const ZPAY_GATEWAY_URL = 'https://zpayz.cn/submit.php';

interface ZpayAutoSubmitFormProps {
  params: ZpaySubmitParams;
}

export function ZpayAutoSubmitForm({ params }: ZpayAutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSubmitting(true);
    formRef.current?.submit();
  }, []);

  return (
    <form
      ref={formRef}
      method="POST"
      action={ZPAY_GATEWAY_URL}
      className="mt-8 space-y-4"
      onSubmit={() => setIsSubmitting(true)}
    >
      {Object.entries(params)
        .filter(([, value]) => typeof value !== 'undefined')
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
      <Button type="submit" className="h-11">
        <LoadingButtonContent loading={isSubmitting} loadingText="正在前往支付...">
          前往支付
        </LoadingButtonContent>
      </Button>
    </form>
  );
}
