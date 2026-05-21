export const BILLING_PLAN_ID = 'internal_monthly_test';

export type BillingPlan = {
  id: typeof BILLING_PLAN_ID;
  name: string;
  durationDays: number;
  amountCents: number;
  currency: 'CNY';
};

function getInternalTestAmountCents() {
  const rawValue = process.env.BILLING_INTERNAL_TEST_AMOUNT_CENTS;
  if (!rawValue) return 100;

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 100;
  }

  return parsed;
}

export function getBillingPlan(planId: string): BillingPlan | null {
  if (planId !== BILLING_PLAN_ID) return null;

  return {
    id: BILLING_PLAN_ID,
    name: 'Ocarinana 内测会员 30 天',
    durationDays: 30,
    amountCents: getInternalTestAmountCents(),
    currency: 'CNY',
  };
}

export function getDefaultBillingPlan() {
  return getBillingPlan(BILLING_PLAN_ID)!;
}

export function formatCnyFromCents(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}
