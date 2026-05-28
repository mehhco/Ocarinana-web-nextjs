'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertCircle, ArrowRight, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type BillingRedirectNoticeProps = {
  title: string;
  description: string;
  billingHref: string;
  backHref: string;
  backLabel: string;
};

export function BillingRedirectNotice({
  title,
  description,
  billingHref,
  backHref,
  backLabel,
}: BillingRedirectNoticeProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push(billingHref);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [billingHref, router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-5 py-10 text-center sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <Card className="w-full border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-normal text-slate-950">{title}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <TimerReset className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>稍后将自动前往订阅页面，你也可以立即继续。</span>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href={backHref}>{backLabel}</Link>
              </Button>
              <Button asChild className="gap-2">
                <Link href={billingHref}>
                  去充值 / 升级
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
