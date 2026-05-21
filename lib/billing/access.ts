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
      isTester: false,
    };
  }

  const { data } = await supabase
    .from('billing_testers')
    .select('active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  return {
    billingEnabled,
    user,
    isTester: data?.active === true,
  };
}

export async function canUseBilling() {
  const access = await getBillingAccess();
  return access.billingEnabled && access.isTester && Boolean(access.user);
}
