import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type UserEntitlements = {
  isPlus: boolean;
  planId: string | null;
  currentPeriodEnd: string | null;
  privateScoreLimit: number;
  publicScoreLimit: number;
  dailyExportLimit: number;
  canExportWithoutWatermark: boolean;
  canUsePrivateShareLinks: boolean;
  canUseAdvancedExport: boolean;
};

export const FREE_ENTITLEMENTS: UserEntitlements = {
  isPlus: false,
  planId: null,
  currentPeriodEnd: null,
  privateScoreLimit: 5,
  publicScoreLimit: 3,
  dailyExportLimit: 3,
  canExportWithoutWatermark: false,
  canUsePrivateShareLinks: false,
  canUseAdvancedExport: false,
};

export function getPlusEntitlements(input: {
  planId: string | null;
  currentPeriodEnd: string | null;
}): UserEntitlements {
  return {
    isPlus: true,
    planId: input.planId,
    currentPeriodEnd: input.currentPeriodEnd,
    privateScoreLimit: 100,
    publicScoreLimit: 50,
    dailyExportLimit: 100,
    canExportWithoutWatermark: true,
    canUsePrivateShareLinks: true,
    canUseAdvancedExport: true,
  };
}

type SubscriptionEntitlementRow = {
  status?: string | null;
  current_period_end?: string | null;
  plan_id?: string | null;
};

function isActiveSubscription(subscription: SubscriptionEntitlementRow | null): subscription is SubscriptionEntitlementRow & {
  status: string;
  current_period_end: string;
} {
  return (
    subscription?.status === 'active' &&
    Boolean(subscription.current_period_end) &&
    new Date(subscription.current_period_end!).getTime() > Date.now()
  );
}

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_id, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  const subscription = data as SubscriptionEntitlementRow | null;
  if (!isActiveSubscription(subscription)) {
    return FREE_ENTITLEMENTS;
  }

  return getPlusEntitlements({
    planId: subscription.plan_id ?? null,
    currentPeriodEnd: subscription.current_period_end,
  });
}

export async function getUserEntitlementsAdmin(userId: string): Promise<UserEntitlements> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_id, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  const subscription = data as SubscriptionEntitlementRow | null;
  if (!isActiveSubscription(subscription)) {
    return FREE_ENTITLEMENTS;
  }

  return getPlusEntitlements({
    planId: subscription.plan_id ?? null,
    currentPeriodEnd: subscription.current_period_end,
  });
}

export function entitlementError(input: {
  code: string;
  message: string;
  limit?: number;
}) {
  return {
    error: input.message,
    code: input.code,
    limit: input.limit,
    upgradeRequired: true,
  };
}
