'use client';

import React from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { User, Moon, Sun, Bell, Shield, HelpCircle, ChevronRight, Star, BarChart2 } from 'lucide-react';

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const SETTINGS = [
  { Icon: Bell,        label: 'Notifications',  sub: 'Alerts & updates' },
  { Icon: Shield,      label: 'Security',        sub: 'Privacy & security' },
  { Icon: HelpCircle,  label: 'Help & Support',  sub: 'FAQs & contact' },
];

export default function ProfilePage() {
  const watchlist = useStockStore((s) => s.watchlist);
  const holdings = useStockStore((s) => s.holdings);
  const cashBalance = useStockStore((s) => s.cashBalance);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const totalInvested = holdings.reduce((sum, h) => sum + h.shares * h.buyPrice, 0);
  const portfolioValue = cashBalance + totalInvested;

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-6">
      {/* User Hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-base font-black text-white">Trader</p>
            <p className="text-xs text-gray-400">Free Plan · Alpha Access</p>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/30 border border-blue-500/20 p-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Portfolio Balance</p>
          <p className="text-2xl font-black text-white">{fmtCurrency(portfolioValue)}</p>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-[10px] text-gray-500">Invested</p>
              <p className="text-sm font-bold text-white">{fmtCurrency(totalInvested)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Cash</p>
              <p className="text-sm font-bold text-emerald-400">{fmtCurrency(cashBalance)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Holdings</p>
              <p className="text-sm font-bold text-white">{holdings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Watchlist</p>
              <p className="text-lg font-black text-white">{watchlist.length}</p>
            </div>
          </div>
          <div className="rounded-xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Positions</p>
              <p className="text-lg font-black text-white">{holdings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 mb-2">
        <div className="rounded-xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Appearance</p>
              <p className="text-[10px] text-gray-500">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button
            onClick={() => toggleTheme()}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4 space-y-2">
        {SETTINGS.map(({ Icon, label, sub }) => (
          <div key={label} className="rounded-xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1f2937]/50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="px-4 mt-6 text-center">
        <p className="text-[10px] text-gray-700">Zetheta Alpha · v1.0.0</p>
      </div>
    </div>
  );
}
