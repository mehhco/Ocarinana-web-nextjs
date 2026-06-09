"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { redeemTrialCard, type TrialCardRedeemReason } from '@/lib/billing/trial-cards';
import { formatDateTime } from '@/lib/personal-center';
import { createClient } from '@/lib/supabase/server';

function redirectWithTrialMessage(type: 'trialError' | 'trialSuccess', message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/protected/me/plus?${params.toString()}`);
}

function getRedeemFailureMessage(reason: TrialCardRedeemReason) {
  switch (reason) {
    case 'invalid_code':
      return '请输入有效的体验卡编号。';
    case 'not_found':
      return '体验卡不存在，请检查编号。';
    case 'inactive':
      return '这张体验卡已停用。';
    case 'expired':
      return '这张体验卡已过期。';
    case 'fully_claimed':
      return '这张体验卡的领取名额已用完。';
    case 'already_redeemed':
      return '你已经兑换过这张体验卡。';
    default:
      return '兑换失败，请稍后再试。';
  }
}

export async function redeemTrialCardAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const code = String(formData.get('trialCardCode') || '').trim();
  const result = await redeemTrialCard({ code, userId: user.id }).catch((redeemError) => {
    console.error('Failed to redeem trial card:', redeemError);
    return null;
  });

  if (!result) {
    redirectWithTrialMessage('trialError', '兑换失败，请查看服务端日志。');
  }

  if (!result.redeemed) {
    redirectWithTrialMessage('trialError', getRedeemFailureMessage(result.reason));
  }

  revalidatePath('/protected/me/plus');
  revalidatePath('/protected/admin');
  const periodText = result.periodEnd ? `，会员有效期至 ${formatDateTime(result.periodEnd)}` : '';
  redirectWithTrialMessage(
    'trialSuccess',
    `兑换成功，已获得 ${result.durationDays || 0} 天 Plus 体验${periodText}。`,
  );
}
