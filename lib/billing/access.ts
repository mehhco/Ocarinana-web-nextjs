import { createClient } from '@/lib/supabase/server';
import { isBillingEnabled } from '@/lib/supabase/config';

export async function getBillingAccess() {
  const supabase = await createClient();
  const [
    billingEnabled,
    {
      data: { user },
      error: userError,
    },
  ] = await Promise.all([isBillingEnabled().catch(() => false), supabase.auth.getUser()]);

  if (userError || !user) {
    return {
      billingEnabled,
      user: null,
      canUseBilling: false,
      isTester: false,
    };
  }

  return {
    billingEnabled,
    user,
    canUseBilling: billingEnabled,
    isTester: false,
  };
}

export async function canUseBilling() {
  const access = await getBillingAccess();
  return access.canUseBilling;
}
