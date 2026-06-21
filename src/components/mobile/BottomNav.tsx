'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, Star, TrendingUp, User } from 'lucide-react';

const TABS = [
  { label: 'Home',      href: '/mobile',             Icon: Home },
  { label: 'Screener',  href: '/mobile/screener',     Icon: BarChart2 },
  { label: 'Watchlist', href: '/mobile/watchlist',    Icon: Star },
  { label: 'Markets',   href: '/mobile/markets',      Icon: TrendingUp },
  { label: 'Profile',   href: '/mobile/profile',      Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="flex items-stretch bg-[#050816] border-t border-[#1f2937]/40 shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ label, href, Icon }) => {
        const active =
          href === '/mobile'
            ? pathname === '/mobile'
            : pathname === href || pathname.startsWith(href + '/');
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative ${
              active ? 'text-blue-400' : 'text-gray-600'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
            )}
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
