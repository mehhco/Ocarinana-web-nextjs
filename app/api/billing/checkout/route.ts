import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBillingAccess } from '@/lib/billing/access';
import { BILLING_PLAN_IDS } from '@/lib/billing/plans';
import { createBillingOrder } from '@/lib/billing/orders';
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

const checkoutSchema = z.object({
  planId: z.enum(BILLING_PLAN_IDS),
  paymentType: z.enum(['alipay', 'wxpay']),
});

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const requestOrigin = request.nextUrl.origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : requestOrigin;

  return origin === requestOrigin || origin === configuredOrigin;
}

export async function POST(request: NextRequest) {
  const identifier = getIdentifier(request);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.STRICT);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  if (!isAllowedOrigin(request)) {
    return jsonNoStore({ error: 'Invalid request origin' }, { status: 403 });
  }

  const access = await getBillingAccess();
  if (!access.user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!access.billingEnabled || !access.isTester) {
    return jsonNoStore({ error: 'Billing is not available' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore(
      { error: 'Invalid checkout request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const order = await createBillingOrder({
    userId: access.user.id,
    planId: parsed.data.planId,
    paymentType: parsed.data.paymentType,
  });

  return jsonNoStore({
    orderId: order.id,
    checkoutUrl: `/protected/billing/checkout/${order.id}`,
  });
}
