"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/admin/access';
import { createAdminClient } from '@/lib/supabase/admin';

const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MANUAL_PLAN_ID = 'plus_manual_admin';

function redirectWithMessage(type: 'error' | 'success', message: string, userId?: string): never {
  const params = new URLSearchParams({ [type]: message });
  if (userId) {
    params.set('userId', userId);
  }

  redirect(`/protected/admin/memberships?${params.toString()}`);
}

function parseShanghaiDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}:00+08:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function setManualMembership(formData: FormData) {
  await requireAdminUser();

  const userId = String(formData.get('userId') || '').trim();
  const expiresAtValue = String(formData.get('expiresAt') || '').trim();

  if (!USER_ID_PATTERN.test(userId)) {
    redirectWithMessage('error', '请输入有效的用户 UUID。');
  }

  const expiresAt = parseShanghaiDateTime(expiresAtValue);
  if (!expiresAt) {
    redirectWithMessage('error', '请输入有效的北京时间到期时间。', userId);
  }

  if (expiresAt.getTime() <= Date.now()) {
    redirectWithMessage('error', '会员到期时间必须晚于当前时间。', userId);
  }

  const supabase = createAdminClient();
  const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !authUser.user) {
    redirectWithMessage('error', '没有找到这个用户，请确认用户 UUID。', userId);
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: MANUAL_PLAN_ID,
        status: 'active',
        current_period_start: nowIso,
        current_period_end: expiresAt.toISOString(),
        latest_order_id: null,
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('Failed to set manual membership:', error);
    redirectWithMessage('error', '设置会员权益失败，请查看服务端日志。', userId);
  }

  revalidatePath('/protected/admin');
  revalidatePath('/protected/admin/memberships');
  redirectWithMessage('success', '已手动设置会员权益。', userId);
}
