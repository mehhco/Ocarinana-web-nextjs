import type { User } from '@supabase/supabase-js';
import { isBillingEnabled } from '@/lib/supabase/config';
import type { Subscription } from '@/lib/billing/orders';
import {
  FREE_ENTITLEMENTS,
  getPlusEntitlements,
  type UserEntitlements,
} from '@/lib/billing/entitlements';
import { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PersonalScoreStats = {
  total: number;
  public: number;
  private: number;
};

export type PersonalUsage = {
  exportCountToday: number;
  usageDate: string;
};

export type PersonalRewardProgress = {
  rewardDaysThisMonth: number;
  rewardDaysRemaining: number;
  rewardMonth: string;
};

export type PersonalOrder = {
  id: string;
  plan_name: string | null;
  amount_cents: number | null;
  payment_type: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
  subscription_period_end: string | null;
};

type PersonalCenterOptions = {
  supabase?: SupabaseServerClient;
  user?: User | null;
};

type SubscriptionEntitlementRow = Subscription & {
  plan_id?: string | null;
  status?: string | null;
  current_period_end?: string | null;
};

function getShanghaiDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getCurrentRewardMonth() {
  return `${getShanghaiDateKey().slice(0, 7)}-01`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '暂无';

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));
}

function getEntitlementsFromSubscription(subscription: SubscriptionEntitlementRow | null): UserEntitlements {
  if (
    subscription?.status !== 'active' ||
    !subscription.current_period_end ||
    new Date(subscription.current_period_end).getTime() <= Date.now()
  ) {
    return FREE_ENTITLEMENTS;
  }

  return getPlusEntitlements({
    planId: subscription.plan_id ?? null,
    currentPeriodEnd: subscription.current_period_end,
  });
}

export async function getPersonalCenterData(userId: string, options: PersonalCenterOptions = {}) {
  const supabase = options.supabase ?? (await createClient());
  const usageDate = getShanghaiDateKey();
  const rewardMonth = getCurrentRewardMonth();

  const [
    billingEnabled,
    accessUser,
    subscriptionResult,
    totalScoresResult,
    publicScoresResult,
    usageResult,
    recentOrdersResult,
    rewardRowsResult,
  ] = await Promise.all([
    isBillingEnabled().catch(() => false),
    options.user !== undefined
      ? Promise.resolve(options.user)
      : supabase.auth.getUser().then(({ data, error }) => (error ? null : data.user)),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('scores')
      .select('score_id', { count: 'exact', head: true })
      .eq('owner_user_id', userId),
    supabase
      .from('scores')
      .select('score_id', { count: 'exact', head: true })
      .eq('owner_user_id', userId)
      .eq('is_public', true),
    supabase
      .from('user_daily_usage')
      .select('export_count')
      .eq('user_id', userId)
      .eq('usage_date', usageDate)
      .maybeSingle(),
    supabase
      .from('billing_orders')
      .select('id, plan_name, amount_cents, payment_type, status, paid_at, created_at, subscription_period_end')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('score_publication_rewards')
      .select('reward_days, status')
      .eq('user_id', userId)
      .eq('reward_month', rewardMonth),
  ]);

  const total = totalScoresResult.count || 0;
  const publicCount = publicScoresResult.count || 0;
  const subscription = subscriptionResult.error ? null : (subscriptionResult.data as Subscription | null);
  const entitlements = getEntitlementsFromSubscription(subscription as SubscriptionEntitlementRow | null);
  const rewardDaysThisMonth = (rewardRowsResult.data || [])
    .filter((row) => row.status === 'granted')
    .reduce((totalDays, row) => totalDays + (row.reward_days || 0), 0);

  return {
    access: {
      billingEnabled,
      user: accessUser,
      canUseBilling: billingEnabled && Boolean(accessUser),
      isTester: false,
    },
    subscription,
    entitlements,
    scoreStats: {
      total,
      public: publicCount,
      private: Math.max(total - publicCount, 0),
    } satisfies PersonalScoreStats,
    usage: {
      exportCountToday: usageResult.data?.export_count || 0,
      usageDate,
    } satisfies PersonalUsage,
    recentOrders: (recentOrdersResult.data || []) as PersonalOrder[],
    rewardProgress: {
      rewardDaysThisMonth,
      rewardDaysRemaining: Math.max(7 - rewardDaysThisMonth, 0),
      rewardMonth,
    } satisfies PersonalRewardProgress,
  };
}
