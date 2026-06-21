'use client';

import React from 'react';
import { X, LayoutDashboard, ScanLine, TrendingUp, Star, Globe, Briefcase, Bell, Settings, ChevronRight, Activity } from 'lucide-react';
import { useMobile } from '../../context/MobileContext';
import Link from 'next/link';

const MENU_ITEMS = [
  { name: 'Dashboard',       href: '/mobile',             Icon: LayoutDashboard },
  { name: 'Stock Screener',  href: '/mobile/screener',    Icon: ScanLine },
  { name: 'Technical Screen',href: '/mobile/screener',    Icon: Activity },
  { name: 'Watchlist',       href: '/mobile/watchlist',   Icon: Star },
  { name: 'Market Overview', href: '/mobile/markets',     Icon: Globe },
  { name: 'Portfolio',       href: '/mobile/profile',     Icon: Briefcase },
  { name: 'Alerts',          href: '/mobile/profile',     Icon: Bell },
  { name: 'Settings',        href: '/mobile/profile',     Icon: Settings },
];

export default function MobileDrawer() {
  const { isDrawerOpen, closeDrawer } = useMobile();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#080E1C] border-r border-[#1f2937]/30 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#1f2937]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-base">Z</span>
            </div>
            <div>
              <p className="text-sm font-black text-white tracking-wider">ZETHETA</p>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Alpha Platform</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1f2937]/30 hover:bg-[#1f2937]/60 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-5 mb-2 text-[9px] font-black uppercase tracking-widest text-gray-600">Navigation</p>
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeDrawer}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#1f2937]/20 transition-colors group mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1f2937]/40 flex items-center justify-center group-hover:bg-blue-600/15 transition-colors">
                  <item.Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors" />
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-5 py-4 border-t border-[#1f2937]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
              T
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">Trader</p>
              <p className="text-[10px] text-gray-500">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
