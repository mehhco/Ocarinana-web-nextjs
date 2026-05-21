import { createHash, timingSafeEqual } from 'crypto';

export const ZPAY_GATEWAY_URL = 'https://zpayz.cn/submit.php';

export type ZpayPaymentType = 'alipay' | 'wxpay';

export type ZpaySubmitParams = {
  pid: string;
  type: ZpayPaymentType;
  out_trade_no: string;
  notify_url: string;
  return_url: string;
  name: string;
  money: string;
  param?: string;
  sign_type: 'MD5';
  sign: string;
};

export type ZpayNotifyParams = Record<string, string>;

function getZpayKey() {
  const key = process.env.ZPAY_KEY;
  if (!key) {
    throw new Error('Missing ZPAY_KEY');
  }
  return key;
}

export function getZpayPid() {
  const pid = process.env.ZPAY_PID;
  if (!pid) {
    throw new Error('Missing ZPAY_PID');
  }
  return pid;
}

function md5(value: string) {
  return createHash('md5').update(value, 'utf8').digest('hex');
}

export function buildZpaySignSource(params: Record<string, unknown>) {
  return Object.entries(params)
    .filter(([key, value]) => {
      return (
        key !== 'sign' &&
        key !== 'sign_type' &&
        value !== null &&
        typeof value !== 'undefined' &&
        String(value) !== ''
      );
    })
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, 'en-US'))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
}

export function signZpayParams(params: Record<string, unknown>) {
  return md5(`${buildZpaySignSource(params)}${getZpayKey()}`);
}

export function verifyZpaySign(params: Record<string, unknown>) {
  const incomingSign = typeof params.sign === 'string' ? params.sign : '';
  if (!incomingSign) return false;

  const expectedSign = signZpayParams(params);
  const expectedBuffer = Buffer.from(expectedSign);
  const incomingBuffer = Buffer.from(incomingSign);

  return (
    expectedBuffer.length === incomingBuffer.length &&
    timingSafeEqual(expectedBuffer, incomingBuffer)
  );
}

export function createZpaySubmitParams(input: {
  type: ZpayPaymentType;
  outTradeNo: string;
  notifyUrl: string;
  returnUrl: string;
  name: string;
  money: string;
  param?: string;
}): ZpaySubmitParams {
  const params = {
    pid: getZpayPid(),
    type: input.type,
    out_trade_no: input.outTradeNo,
    notify_url: input.notifyUrl,
    return_url: input.returnUrl,
    name: input.name,
    money: input.money,
    param: input.param,
  };

  return {
    ...params,
    sign_type: 'MD5',
    sign: signZpayParams(params),
  };
}
