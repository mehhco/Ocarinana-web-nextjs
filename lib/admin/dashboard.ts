import { createAdminClient } from '@/lib/supabase/admin';

export type AdminDashboardSummary = {
  totalUsers: number;
  newUsers7d: number;
  totalScores: number;
  publicScores: number;
  privateScores: number;
  activeSubscriptions: number;
  pendingOrders: number;
  paidOrders: number;
  failedOrders: number;
  closedOrders: number;
  paidAmountCents: number;
  paidOrders7d: number;
};

export type AdminRecentUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
};

export type AdminRecentScore = {
  scoreId: string;
  ownerUserId: string;
  ownerEmail: string | null;
  title: string;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminRecentOrder = {
  id: string;
  outTradeNo: string;
  userId: string;
  userEmail: string | null;
  planName: string;
  amountCents: number;
  currency: string;
  paymentType: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
  subscriptionPeriodEnd: string | null;
};

export type AdminActiveSubscription = {
  id: string;
  userId: string;
  userEmail: string | null;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  latestOrderId: string | null;
};

export type AdminDailyTrendPoint = {
  date: string;
  newUsers: number;
  newScores: number;
  publishedScores: number;
  paidOrders: number;
  paidAmountCents: number;
};

export type AdminDashboardData = {
  summary: AdminDashboardSummary;
  dailyTrends: AdminDailyTrendPoint[];
  recentUsers: AdminRecentUser[];
  recentScores: AdminRecentScore[];
  recentOrders: AdminRecentOrder[];
  activeSubscriptions: AdminActiveSubscription[];
};

type AdminDashboardSummaryRow = {
  total_users: number | string | null;
  new_users_7d: number | string | null;
  total_scores: number | string | null;
  public_scores: number | string | null;
  private_scores: number | string | null;
  active_subscriptions: number | string | null;
  pending_orders: number | string | null;
  paid_orders: number | string | null;
  failed_orders: number | string | null;
  closed_orders: number | string | null;
  paid_amount_cents: number | string | null;
  paid_orders_7d: number | string | null;
};

type AdminDailyTrendRow = {
  trend_date: string | null;
  new_users: number | string | null;
  new_scores: number | string | null;
  published_scores: number | string | null;
  paid_orders: number | string | null;
  paid_amount_cents: number | string | null;
};

type RecentScoreRow = {
  score_id: string;
  owner_user_id: string;
  title: string | null;
  is_public: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RecentOrderRow = {
  id: string;
  out_trade_no: string;
  user_id: string;
  plan_name: string | null;
  amount_cents: number | null;
  currency: string | null;
  payment_type: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
  subscription_period_end: string | null;
};

type ActiveSubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  latest_order_id: string | null;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeSummary(row: AdminDashboardSummaryRow | null | undefined): AdminDashboardSummary {
  return {
    totalUsers: toNumber(row?.total_users),
    newUsers7d: toNumber(row?.new_users_7d),
    totalScores: toNumber(row?.total_scores),
    publicScores: toNumber(row?.public_scores),
    privateScores: toNumber(row?.private_scores),
    activeSubscriptions: toNumber(row?.active_subscriptions),
    pendingOrders: toNumber(row?.pending_orders),
    paidOrders: toNumber(row?.paid_orders),
    failedOrders: toNumber(row?.failed_orders),
    closedOrders: toNumber(row?.closed_orders),
    paidAmountCents: toNumber(row?.paid_amount_cents),
    paidOrders7d: toNumber(row?.paid_orders_7d),
  };
}

function normalizeDailyTrends(rows: AdminDailyTrendRow[] | null | undefined): AdminDailyTrendPoint[] {
  return (rows || []).map((row) => ({
    date: row.trend_date || '',
    newUsers: toNumber(row.new_users),
    newScores: toNumber(row.new_scores),
    publishedScores: toNumber(row.published_scores),
    paidOrders: toNumber(row.paid_orders),
    paidAmountCents: toNumber(row.paid_amount_cents),
  }));
}

async function getUserEmailMap(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  const entries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        console.error('Failed to fetch admin dashboard user email:', error);
        return [userId, null] as const;
      }

      return [userId, data.user?.email ?? null] as const;
    }),
  );

  return new Map(entries);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const [summaryResult, trendsResult, usersResult, scoresResult, ordersResult, subscriptionsResult] =
    await Promise.all([
      supabase.rpc('get_admin_dashboard_summary').single(),
      supabase.rpc('get_admin_dashboard_daily_trends', { p_days: 30 }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 50 }),
      supabase
        .from('scores')
        .select('score_id, owner_user_id, title, is_public, published_at, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(8),
      supabase
        .from('billing_orders')
        .select(
          'id, out_trade_no, user_id, plan_name, amount_cents, currency, payment_type, status, paid_at, created_at, subscription_period_end',
        )
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, status, current_period_start, current_period_end, latest_order_id')
        .eq('status', 'active')
        .gt('current_period_end', nowIso)
        .order('current_period_end', { ascending: true })
        .limit(8),
    ]);

  if (summaryResult.error) {
    throw summaryResult.error;
  }

  if (trendsResult.error) {
    throw trendsResult.error;
  }

  if (usersResult.error) {
    throw usersResult.error;
  }

  if (scoresResult.error) {
    throw scoresResult.error;
  }

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (subscriptionsResult.error) {
    throw subscriptionsResult.error;
  }

  const scores = (scoresResult.data || []) as RecentScoreRow[];
  const orders = (ordersResult.data || []) as RecentOrderRow[];
  const subscriptions = (subscriptionsResult.data || []) as ActiveSubscriptionRow[];
  const userEmailMap = await getUserEmailMap(supabase, [
    ...scores.map((score) => score.owner_user_id),
    ...orders.map((order) => order.user_id),
    ...subscriptions.map((subscription) => subscription.user_id),
  ]);

  const recentUsers = (usersResult.data.users || [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
    }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  return {
    summary: normalizeSummary(summaryResult.data as AdminDashboardSummaryRow | null),
    dailyTrends: normalizeDailyTrends(trendsResult.data as AdminDailyTrendRow[] | null),
    recentUsers,
    recentScores: scores.map((score) => ({
      scoreId: score.score_id,
      ownerUserId: score.owner_user_id,
      ownerEmail: userEmailMap.get(score.owner_user_id) ?? null,
      title: score.title || '未命名乐谱',
      isPublic: score.is_public === true,
      publishedAt: score.published_at,
      createdAt: score.created_at,
      updatedAt: score.updated_at,
    })),
    recentOrders: orders.map((order) => ({
      id: order.id,
      outTradeNo: order.out_trade_no,
      userId: order.user_id,
      userEmail: userEmailMap.get(order.user_id) ?? null,
      planName: order.plan_name || '未知套餐',
      amountCents: order.amount_cents || 0,
      currency: order.currency || 'CNY',
      paymentType: order.payment_type || 'unknown',
      status: order.status || 'unknown',
      paidAt: order.paid_at,
      createdAt: order.created_at,
      subscriptionPeriodEnd: order.subscription_period_end,
    })),
    activeSubscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      userId: subscription.user_id,
      userEmail: userEmailMap.get(subscription.user_id) ?? null,
      planId: subscription.plan_id || 'unknown',
      status: subscription.status || 'unknown',
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      latestOrderId: subscription.latest_order_id,
    })),
  };
}
