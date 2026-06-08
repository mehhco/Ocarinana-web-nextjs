import type { User } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type AdminUser = {
  user_id: string;
  active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function isAdminUserId(userId: string | null | undefined): Promise<boolean> {
  if (!userId) {
    return false;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('Failed to check admin access:', error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error('Failed to create admin client for access check:', error);
    return false;
  }
}

export async function requireAdminUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const allowed = await isAdminUserId(user.id);
  if (!allowed) {
    notFound();
  }

  return user;
}
