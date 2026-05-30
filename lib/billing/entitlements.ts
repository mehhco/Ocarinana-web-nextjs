import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type UserEntitlements = {
  isPlus: boolean;
  planId: string | null;
  currentPeriodEnd: string | null;
  privateScoreLimit: number;
  publicScoreLimit: number | null;
  dailyExportLimit: number;
  canExportWithoutWatermark: boolean;
  canUsePrivateShareLinks: boolean;
  canUseAdvancedExport: boolean;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export const PRIVATE_SCORE_LIMIT_ERROR_CODE = 'PRIVATE_SCORE_LIMIT_REACHED';

export const FREE_ENTITLEMENTS: UserEntitlements = {
  isPlus: false,
  planId: null,
  currentPeriodEnd: null,
  privateScoreLimit: 5,
  publicScoreLimit: null,
  dailyExportLimit: 5,
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
    publicScoreLimit: null,
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

export async function getUserPrivateScoreCount(
  userId: string,
  supabase?: SupabaseServerClient
): Promise<number> {
  const client = supabase ?? (await createClient());
  const { count, error } = await client
    .from('scores')
    .select('score_id', { count: 'exact', head: true })
    .eq('owner_user_id', userId)
    .eq('is_public', false);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getPrivateScoreLimitStatus(
  userId: string,
  supabase?: SupabaseServerClient
) {
  const [entitlements, privateScoreCount] = await Promise.all([
    getUserEntitlements(userId),
    getUserPrivateScoreCount(userId, supabase),
  ]);

  return {
    entitlements,
    privateScoreCount,
    limitReached: privateScoreCount >= entitlements.privateScoreLimit,
  };
}

export function privateScoreLimitError(input: {
  entitlements: UserEntitlements;
  privateScoreCount?: number;
}) {
  const countText =
    typeof input.privateScoreCount === 'number'
      ? `当前已保存 ${input.privateScoreCount} 首私有乐谱，`
      : '';

  return entitlementError({
    code: PRIVATE_SCORE_LIMIT_ERROR_CODE,
    message: `${countText}当前账号最多可保存 ${input.entitlements.privateScoreLimit} 首私有乐谱，公开乐谱不计入限制；升级 Plus 可保存更多私有作品。`,
    limit: input.entitlements.privateScoreLimit,
  });
}

export function isPrivateScoreLimitError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  return message.includes(PRIVATE_SCORE_LIMIT_ERROR_CODE);
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
  limit?: number | null;
}) {
  return {
    error: input.message,
    code: input.code,
    limit: input.limit,
    upgradeRequired: true,
  };
}
