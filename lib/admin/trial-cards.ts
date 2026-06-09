import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export type AdminTrialCard = {
  id: string;
  code: string;
  maxRedemptions: number;
  claimedCount: number;
  durationDays: number;
  expiresAt: string;
  active: boolean;
  note: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  recentRedemptions: AdminTrialCardRedemption[];
};

export type AdminTrialCardRedemption = {
  id: string;
  userId: string;
  userEmail: string | null;
  durationDays: number;
  periodStart: string;
  periodEnd: string;
  redeemedAt: string;
};

type TrialCardRow = {
  id: string;
  code: string;
  max_redemptions: number;
  claimed_count: number;
  duration_days: number;
  expires_at: string;
  active: boolean;
  note: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type TrialCardRedemptionRow = {
  id: string;
  trial_card_id: string;
  user_id: string;
  duration_days: number;
  period_start: string;
  period_end: string;
  redeemed_at: string;
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
        console.error('Failed to fetch trial card redemption user email:', error);
        return [userId, null] as const;
      }

      return [userId, data.user?.email ?? null] as const;
    }),
  );

  return new Map(entries);
}

export async function getAdminTrialCards(): Promise<AdminTrialCard[]> {
  const supabase = createAdminClient();
  const { data: cardsData, error: cardsError } = await supabase
    .from('trial_cards')
    .select('id, code, max_redemptions, claimed_count, duration_days, expires_at, active, note, created_by_user_id, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(30);

  if (cardsError) {
    throw cardsError;
  }

  const cards = (cardsData || []) as TrialCardRow[];
  if (cards.length === 0) {
    return [];
  }

  const cardIds = cards.map((card) => card.id);
  const { data: redemptionsData, error: redemptionsError } = await supabase
    .from('trial_card_redemptions')
    .select('id, trial_card_id, user_id, duration_days, period_start, period_end, redeemed_at')
    .in('trial_card_id', cardIds)
    .order('redeemed_at', { ascending: false })
    .limit(120);

  if (redemptionsError) {
    throw redemptionsError;
  }

  const redemptions = (redemptionsData || []) as TrialCardRedemptionRow[];
  const userEmailMap = await getUserEmailMap(supabase, redemptions.map((row) => row.user_id));
  const redemptionMap = new Map<string, AdminTrialCardRedemption[]>();

  redemptions.forEach((row) => {
    const current = redemptionMap.get(row.trial_card_id) || [];
    if (current.length >= 5) {
      return;
    }

    current.push({
      id: row.id,
      userId: row.user_id,
      userEmail: userEmailMap.get(row.user_id) ?? null,
      durationDays: row.duration_days,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      redeemedAt: row.redeemed_at,
    });
    redemptionMap.set(row.trial_card_id, current);
  });

  return cards.map((card) => ({
    id: card.id,
    code: card.code,
    maxRedemptions: card.max_redemptions,
    claimedCount: card.claimed_count,
    durationDays: card.duration_days,
    expiresAt: card.expires_at,
    active: card.active,
    note: card.note,
    createdByUserId: card.created_by_user_id,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
    recentRedemptions: redemptionMap.get(card.id) || [],
  }));
}

export async function createAdminTrialCard(input: {
  maxRedemptions: number;
  durationDays: number;
  expiresAt: Date;
  note: string | null;
  createdByUserId: string;
}) {
  const supabase = createAdminClient();
  const code = randomUUID();
  const { data, error } = await supabase
    .from('trial_cards')
    .insert({
      code,
      max_redemptions: input.maxRedemptions,
      duration_days: input.durationDays,
      expires_at: input.expiresAt.toISOString(),
      note: input.note,
      created_by_user_id: input.createdByUserId,
    })
    .select('id, code')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; code: string };
}

export async function deactivateAdminTrialCard(cardId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('trial_cards')
    .update({ active: false })
    .eq('id', cardId);

  if (error) {
    throw error;
  }
}
