import type { Metadata } from 'next';
import { AdminNavTabs } from '@/components/admin/AdminNavTabs';
import { requireAdminUser } from '@/lib/admin/access';

export const metadata: Metadata = {
  title: '后台 - Ocarinana',
  description: '查看和管理 Ocarinana 后台关键数据',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdminUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 py-4">
      <header className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">后台</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-zinc-950">管理 Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">
              查看关键数据，并执行少量需要管理员权限的人工处理。
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            当前管理员：
            <span className="ml-1 font-medium text-zinc-950">
              {adminUser.email || adminUser.id}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <AdminNavTabs />
        </div>
      </header>

      {children}
    </div>
  );
}
