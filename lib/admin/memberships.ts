import { createAdminClient } from '@/lib/supabase/admin';

export type AdminMembershipRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  latestOrderId: string | null;
  updatedAt: string | null;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  latest_order_id: string | null;
  updated_at: string | null;
};

async function getUserEmailMap(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  const entries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        console.error('Failed to fetch admin membership user email:', error);
        return [userId, null] as const;
      }

      return [userId, data.user?.email ?? null] as const;
    }),
  );

  return new Map(entries);
}

export async function getAdminMemberships(): Promise<AdminMembershipRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id, status, current_period_start, current_period_end, latest_order_id, updated_at')
    .eq('status', 'active')
    .order('current_period_end', { ascending: false })
    .limit(30);

  if (error) {
    throw error;
  }

  const rows = (data || []) as SubscriptionRow[];
  const userEmailMap = await getUserEmailMap(supabase, rows.map((row) => row.user_id));

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userEmail: userEmailMap.get(row.user_id) ?? null,
    planId: row.plan_id || 'unknown',
    status: row.status || 'unknown',
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    latestOrderId: row.latest_order_id,
    updatedAt: row.updated_at,
  }));
}
