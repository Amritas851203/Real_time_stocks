'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useMobile } from '../../context/MobileContext';
import { useRouter } from 'next/navigation';

export default function MobileNav() {
  const { openDrawer } = useMobile();
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#050816] border-b border-[#1f2937]/30 shrink-0">
      {/* Logo */}
      <button onClick={() => router.push('/mobile')} className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-black text-xs">Z</span>
        </div>
        <span className="text-sm font-black text-white tracking-wider">ZETHETA</span>
      </button>

      {/* Right Icons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => router.push('/mobile/screener')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#0B1220] transition-colors"
          title="Search Stocks"
        >
          <Search className="w-4.5 h-4.5 text-gray-400" />
        </button>
        <button
          onClick={() => router.push('/mobile/alerts')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#0B1220] transition-colors relative"
          title="Price Alerts"
        >
          <Bell className="w-4.5 h-4.5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
        <button
          onClick={openDrawer}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#0B1220] transition-colors"
        >
          <Menu className="w-4.5 h-4.5 text-gray-300" />
        </button>
      </div>
    </header>
  );
}
