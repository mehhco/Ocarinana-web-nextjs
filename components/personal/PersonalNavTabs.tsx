"use client";

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PendingLink } from '@/components/pending-link';

const items = [
  { href: '/protected/me/scores', label: '我的乐谱' },
  { href: '/protected/me/overview', label: '概览' },
  { href: '/protected/me/plus', label: 'Plus 权益' },
  { href: '/protected/me/account', label: '账户与订单' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PersonalNavTabs() {
  const pathname = usePathname() || '/protected/me';

  return (
    <div className="overflow-x-auto scrollbar-hide border-b border-zinc-200">
      <nav className="flex min-w-max gap-2" aria-label="个人中心">
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
