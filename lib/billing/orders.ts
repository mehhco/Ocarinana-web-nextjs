import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getBillingPlan } from '@/lib/billing/plans';
import type { ZpayPaymentType } from '@/lib/billing/zpay';

export type BillingOrderStatus = 'pending' | 'paid' | 'failed' | 'closed';

export type BillingOrder = {
  id: string;
  out_trade_no: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount_cents: number;
  currency: string;
  duration_days: number;
  payment_type: ZpayPaymentType;
  status: BillingOrderStatus;
  zpay_trade_no: string | null;
  zpay_param: string | null;
  subscription_period_end: string | null;
  paid_at: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'canceled';
  current_period_start: string;
  current_period_end: string;
  latest_order_id: string | null;
};

function createOutTradeNo() {
  const timestamp = Date.now().toString();
  const suffix = Math.random().toString().slice(2, 10);
  return `${timestamp}${suffix}`.slice(0, 32);
}

export async function createBillingOrder(input: {
  userId: string;
  planId: string;
  paymentType: ZpayPaymentType;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan) {
    throw new Error('Unknown billing plan');
  }

  const supabase = createAdminClient();
  const outTradeNo = createOutTradeNo();

  const { data, error } = await supabase
    .from('billing_orders')
    .insert({
      out_trade_no: outTradeNo,
      user_id: input.userId,
      plan_id: plan.id,
      plan_name: plan.name,
      amount_cents: plan.amountCents,
      currency: plan.currency,
      duration_days: plan.durationDays,
      payment_type: input.paymentType,
      zpay_param: outTradeNo,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as BillingOrder;
}

export async function getUserBillingOrder(orderId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('billing_orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BillingOrder | null;
}

export async function getCurrentSubscription(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Subscription | null;
}
