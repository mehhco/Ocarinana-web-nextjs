import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserBillingOrder } from '@/lib/billing/orders';
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identifier = getIdentifier(request);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LENIENT);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const order = await getUserBillingOrder(id, user.id);
  if (!order) {
    return jsonNoStore({ error: 'Not found' }, { status: 404 });
  }

  return jsonNoStore({
    id: order.id,
    outTradeNo: order.out_trade_no,
    status: order.status,
    planName: order.plan_name,
    amountCents: order.amount_cents,
    paymentType: order.payment_type,
    paidAt: order.paid_at,
    subscriptionPeriodEnd: order.subscription_period_end,
  });
}
