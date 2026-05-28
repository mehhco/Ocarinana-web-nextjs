import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PersonalNavTabs } from '@/components/personal/PersonalNavTabs';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: '我的 - Ocarinana',
  description: '管理你的乐谱、Plus 权益和账户订单',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 py-4">
      <header className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-emerald-800">个人中心</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-zinc-950">我的</h1>
          <p className="mt-2 text-sm text-zinc-600">
            统一管理创作数据、乐谱、Plus 权益和账户订单。
          </p>
        </div>
        <PersonalNavTabs />
      </header>
      {children}
    </div>
  );
}
