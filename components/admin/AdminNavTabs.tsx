"use client";

import { usePathname } from 'next/navigation';
import { PendingLink } from '@/components/pending-link';
import { cn } from '@/lib/utils';

const items = [
  { href: '/protected/admin', label: '概览' },
  { href: '/protected/admin/memberships', label: '会员权益' },
  { href: '/protected/admin/trial-cards', label: '体验卡' },
];

function isActive(pathname: string, href: string) {
  if (href === '/protected/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavTabs() {
  const pathname = usePathname() || '/protected/admin';

  return (
    <div className="overflow-x-auto scrollbar-hide border-b border-zinc-200">
      <nav className="flex min-w-max gap-2" aria-label="后台管理">
        {items.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <PendingLink
              key={item.href}
              href={item.href}
              pendingText={`${item.label}...`}
              className={cn(
                'relative inline-flex h-11 items-center justify-center px-3 text-sm font-medium text-zinc-600 transition-colors',
                'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:transition-transform',
                active
                  ? 'text-emerald-800 after:scale-x-100 after:bg-emerald-600'
                  : 'after:scale-x-0 hover:text-emerald-800',
              )}
            >
              {item.label}
            </PendingLink>
          );
        })}
      </nav>
    </div>
  );
}
