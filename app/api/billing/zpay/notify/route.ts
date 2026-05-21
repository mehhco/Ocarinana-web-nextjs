import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCnyFromCents } from '@/lib/billing/plans';
import { getZpayPid, verifyZpaySign } from '@/lib/billing/zpay';

type BillingOrderForNotify = {
  id: string;
  out_trade_no: string;
  amount_cents: number;
  payment_type: string;
  status: string;
};

function textNoStore(body: string, init?: ResponseInit) {
  const response = new NextResponse(body, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function paramsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

async function getNotifyParams(request: NextRequest) {
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      return paramsToRecord(new URLSearchParams(text));
    }
  }

  return paramsToRecord(request.nextUrl.searchParams);
}

async function recordEvent(input: {
  orderId?: string;
  params: Record<string, string>;
  signatureValid: boolean;
  processingResult: string;
  errorMessage?: string;
}) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('billing_events')
    .insert({
      order_id: input.orderId,
      provider: 'zpay',
      event_type: 'notify',
      out_trade_no: input.params.out_trade_no || null,
      zpay_trade_no: input.params.trade_no || null,
      payload: input.params,
      signature_valid: input.signatureValid,
      processing_result: input.processingResult,
      error_message: input.errorMessage,
    })
    .select('id')
    .single();

  return data?.id as string | undefined;
}

async function updateEvent(eventId: string | undefined, result: string, errorMessage?: string) {
  if (!eventId) return;

  const supabase = createAdminClient();
  await supabase
    .from('billing_events')
    .update({
      processing_result: result,
      error_message: errorMessage,
    })
    .eq('id', eventId);
}

async function handleNotify(request: NextRequest) {
  const params = await getNotifyParams(request);
  const signatureValid = verifyZpaySign(params);
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from('billing_orders')
    .select('id, out_trade_no, amount_cents, payment_type, status')
    .eq('out_trade_no', params.out_trade_no || '')
    .maybeSingle();

  const eventId = await recordEvent({
    orderId: order?.id,
    params,
    signatureValid,
    processingResult: 'received',
  });

  if (!signatureValid) {
    await updateEvent(eventId, 'rejected', 'Invalid ZPAY signature');
    return textNoStore('fail', { status: 400 });
  }

  if (!order) {
    await updateEvent(eventId, 'rejected', 'Billing order not found');
    return textNoStore('fail', { status: 404 });
  }

  const expectedMoney = formatCnyFromCents((order as BillingOrderForNotify).amount_cents);
  const failures = [
    params.pid !== getZpayPid() ? 'pid mismatch' : null,
    params.trade_status !== 'TRADE_SUCCESS' ? 'trade_status is not TRADE_SUCCESS' : null,
    params.money !== expectedMoney ? 'money mismatch' : null,
    params.type !== (order as BillingOrderForNotify).payment_type ? 'payment type mismatch' : null,
  ].filter(Boolean);

  if (failures.length > 0) {
    await updateEvent(eventId, 'rejected', failures.join('; '));
    return textNoStore('fail', { status: 400 });
  }

  const { data, error } = await supabase.rpc('apply_zpay_billing_payment', {
    p_out_trade_no: params.out_trade_no,
    p_trade_no: params.trade_no || '',
    p_payload: params,
  });

  if (error) {
    await updateEvent(eventId, 'error', error.message);
    return textNoStore('fail', { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : null;
  await updateEvent(eventId, result?.already_paid ? 'duplicate_success' : 'success');
  return textNoStore('success');
}

export async function GET(request: NextRequest) {
  return handleNotify(request);
}

export async function POST(request: NextRequest) {
  return handleNotify(request);
}
