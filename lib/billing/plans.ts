export const BILLING_PLAN_IDS = ['plus_monthly', 'plus_quarterly', 'plus_yearly'] as const;

export type BillingPlan = {
  id: (typeof BILLING_PLAN_IDS)[number];
  name: string;
  durationDays: number;
  amountCents: number;
  currency: 'CNY';
  badge?: string;
  recommended?: boolean;
  description: string;
};

type PlanOverrides = Partial<Record<BillingPlan['id'], number>>;

function getPlanOverrides(): PlanOverrides {
  const rawValue = process.env.BILLING_PLAN_AMOUNT_CENTS_JSON;
  if (!rawValue) return {};

  try {
    return JSON.parse(rawValue) as PlanOverrides;
  } catch {
    return {};
  }
}

const DEFAULT_PLANS: BillingPlan[] = [
  {
    id: 'plus_monthly',
    name: 'Plus 月卡',
    durationDays: 30,
    amountCents: 990,
    currency: 'CNY',
    description: '适合先体验完整导出、私密分享和更高保存额度。',
  },
  {
    id: 'plus_quarterly',
    name: 'Plus 季卡',
    durationDays: 90,
    amountCents: 2500,
    currency: 'CNY',
    badge: '推荐',
    recommended: true,
    description: '适合稳定练习和持续创作，价格比月卡更划算。',
  },
  {
    id: 'plus_yearly',
    name: 'Plus 年卡',
    durationDays: 365,
    amountCents: 8800,
    currency: 'CNY',
    badge: '最省',
    description: '适合长期使用 Ocarinana 管理陶笛曲谱。',
  },
];

function applyPlanOverride(plan: BillingPlan, overrides: PlanOverrides): BillingPlan {
  const overrideAmount = overrides[plan.id];
  if (!overrideAmount || !Number.isFinite(overrideAmount) || overrideAmount <= 0) {
    return plan;
  }

  return {
    ...plan,
    amountCents: overrideAmount,
  };
}

export function getBillingPlan(planId: string): BillingPlan | null {
  const plan = DEFAULT_PLANS.find((item) => item.id === planId);
  if (!plan) return null;

  return applyPlanOverride(plan, getPlanOverrides());
}

export function getBillingPlans() {
  const overrides = getPlanOverrides();
  return DEFAULT_PLANS.map((plan) => applyPlanOverride(plan, overrides));
}

export function formatCnyFromCents(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}
