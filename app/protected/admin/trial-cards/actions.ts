"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminTrialCard, deactivateAdminTrialCard } from '@/lib/admin/trial-cards';
import { requireAdminUser } from '@/lib/admin/access';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function redirectWithMessage(type: 'error' | 'success', message: string, createdCode?: string): never {
  const params = new URLSearchParams({ [type]: message });
  if (createdCode) {
    params.set('createdCode', createdCode);
  }

  redirect(`/protected/admin/trial-cards?${params.toString()}`);
}

function parsePositiveInteger(value: FormDataEntryValue | null) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function parseShanghaiDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}:00+08:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createTrialCardAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const maxRedemptions = parsePositiveInteger(formData.get('maxRedemptions'));
  const durationDays = parsePositiveInteger(formData.get('durationDays'));
  const expiresAtValue = String(formData.get('expiresAt') || '').trim();
  const noteValue = String(formData.get('note') || '').trim();
  const note = noteValue ? noteValue.slice(0, 500) : null;

  if (!maxRedemptions || maxRedemptions > 100000) {
    redirectWithMessage('error', '领取数量需要是 1 到 100000 之间的整数。');
  }

  if (!durationDays || durationDays > 365) {
    redirectWithMessage('error', '体验时长需要是 1 到 365 天之间的整数。');
  }

  const expiresAt = parseShanghaiDateTime(expiresAtValue);
  if (!expiresAt || expiresAt.getTime() <= Date.now()) {
    redirectWithMessage('error', '请输入晚于当前时间的体验卡过期时间。');
  }

  let createdCode: string;

  try {
    const card = await createAdminTrialCard({
      maxRedemptions,
      durationDays,
      expiresAt,
      note,
      createdByUserId: adminUser.id,
    });
    createdCode = card.code;
  } catch (error) {
    console.error('Failed to create trial card:', error);
    redirectWithMessage('error', '生成体验卡失败，请查看服务端日志。');
  }

  revalidatePath('/protected/admin/trial-cards');
  redirectWithMessage('success', '已生成体验卡。', createdCode);
}

export async function deactivateTrialCardAction(formData: FormData) {
  await requireAdminUser();
  const cardId = String(formData.get('cardId') || '').trim();

  if (!UUID_PATTERN.test(cardId)) {
    redirectWithMessage('error', '体验卡 ID 无效。');
  }

  try {
    await deactivateAdminTrialCard(cardId);
  } catch (error) {
    console.error('Failed to deactivate trial card:', error);
    redirectWithMessage('error', '停用体验卡失败，请查看服务端日志。');
  }

  revalidatePath('/protected/admin/trial-cards');
  redirectWithMessage('success', '已停用体验卡。');
}
