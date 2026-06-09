import { createAdminClient } from '@/lib/supabase/admin';

export type TrialCardRedeemReason =
  | 'redeemed'
  | 'not_found'
  | 'inactive'
  | 'expired'
  | 'fully_claimed'
  | 'already_redeemed'
  | 'invalid_code'
  | 'unknown';

export type TrialCardRedeemResult = {
  redeemed: boolean;
  reason: TrialCardRedeemReason;
  durationDays: number | null;
  periodEnd: string | null;
  remainingRedemptions: number | null;
};

type TrialCardRedeemRow = {
  redeemed: boolean | null;
  reason: string | null;
  duration_days: number | null;
  period_end: string | null;
  remaining_redemptions: number | null;
};

const TRIAL_CARD_CODE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeReason(reason: string | null | undefined): TrialCardRedeemReason {
  switch (reason) {
    case 'redeemed':
    case 'not_found':
    case 'inactive':
    case 'expired':
    case 'fully_claimed':
    case 'already_redeemed':
      return reason;
    default:
      return 'unknown';
  }
}

export function normalizeTrialCardCode(code: string) {
  return code.trim().toLowerCase();
}

export function isValidTrialCardCode(code: string) {
  return TRIAL_CARD_CODE_PATTERN.test(code);
}

export async function redeemTrialCard(input: {
  code: string;
  userId: string;
}): Promise<TrialCardRedeemResult> {
  const code = normalizeTrialCardCode(input.code);
  if (!isValidTrialCardCode(code)) {
    return {
      redeemed: false,
      reason: 'invalid_code',
      durationDays: null,
      periodEnd: null,
      remainingRedemptions: null,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('redeem_trial_card', {
    p_code: code,
    p_user_id: input.userId,
  });

  if (error) {
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as TrialCardRedeemRow | null;
  return {
    redeemed: row?.redeemed === true,
    reason: normalizeReason(row?.reason),
    durationDays: typeof row?.duration_days === 'number' ? row.duration_days : null,
    periodEnd: typeof row?.period_end === 'string' ? row.period_end : null,
    remainingRedemptions:
      typeof row?.remaining_redemptions === 'number' ? row.remaining_redemptions : null,
  };
}
