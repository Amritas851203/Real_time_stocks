'use client';

import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { useStockStore } from '../../store/useStockStore';
import {
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
  Star,
  LineChart,
  Globe,
  Newspaper,
  Briefcase,
  Bell,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView, showToast } = useUiStore();
  const watchlist = useStockStore((state) => state.watchlist);
  const alerts = useStockStore((state) => state.alerts);

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'screener',
      name: 'Stock Screener',
      icon: SlidersHorizontal,
      badge: null,
    },
    {
      id: 'technical',
      name: 'Technical Screen',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'watchlist',
      name: 'My Watchlist',
      icon: Star,
      badge: watchlist.length > 0 ? watchlist.length : null,
    },
    {
      id: 'charts',
      name: 'Chart Analysis',
      icon: LineChart,
      badge: null,
    },
    {
      id: 'market',
      name: 'Market Overview',
      icon: Globe,
      badge: null,
    },
    {
      id: 'news',
      name: 'News & Events',
      icon: Newspaper,
      badge: null,
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      icon: Briefcase,
      badge: null,
    },
    {
      id: 'alerts',
      name: 'Alerts',
      icon: Bell,
      badge: alerts.filter(a => a.status === 'active').length > 0 ? alerts.filter(a => a.status === 'active').length : null,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      badge: null,
    },
  ] as const;

  const handleItemClick = (id: typeof menuItems[number]['id']) => {
    setActiveView(id);
  };

  return (
    <aside
      className={`bg-[#050816] border-r border-[#1f2937]/50 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none hidden sm:block ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2937]/50">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              {/* Dynamic Logo Symbol */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 flex items-center justify-center font-black text-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse select-none">
                Ω
              </div>
              <div className="flex flex-col">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-150 to-gray-400 text-xs tracking-wider uppercase leading-none">
                  Zetheta Alpha
                </span>
                <span className="text-[7.5px] text-emerald-400 font-extrabold tracking-widest uppercase mt-0.5">
                  Institutional terminal
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg bg-[#0B1220] hover:bg-[#111827] border border-[#1f2937]/50 text-gray-400 hover:text-white transition-all duration-200 ml-auto"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav Menu Items */}
        <nav className="py-4 px-2 space-y-0.5 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {menuItems.map((item) => {
            const isSelected = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center rounded-lg p-2.5 text-[11px] font-bold transition-all duration-150 group relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-550/15 to-blue-500/5 border-l-2 border-blue-500 text-blue-400 shadow-[inset_4px_0_10px_rgba(59,130,246,0.05)]'
                    : 'text-gray-400 hover:bg-[#0B1220] hover:text-white border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-250'}`} />
                {sidebarOpen && (
                  <span className="ml-3 truncate font-semibold">{item.name}</span>
                )}
                
                {/* Dynamically Styled Badges */}
                {sidebarOpen && item.badge !== null && (
                  <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full border leading-none ${
                    item.id === 'alerts'
                      ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-450 border-blue-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Floating Glass "Upgrade to Pro" Card & Connection status */}
      <div className="p-3 border-t border-[#1f2937]/50 flex flex-col space-y-3">
        {sidebarOpen && (
          <div className="glass-card p-3 rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-950/10 to-[#111827] flex flex-col space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
            <div className="flex items-center space-x-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">Upgrade to Pro</span>
            </div>
            <p className="text-[9px] text-gray-400 leading-normal font-semibold">
              Unlock advanced filters, high-frequency backtests & AI analysis.
            </p>
            <button
              onClick={() => showToast('Connecting to payment gateway...', 'info')}
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)]"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Real-time Connection Indicator */}
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 px-1">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping" />
                <span className="text-gray-400">Feed Status</span>
              </div>
              <span className="text-emerald-450 uppercase font-black tracking-wider">Streaming Live</span>
            </>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-ping mx-auto" />
          )}
        </div>
      </div>
    </aside>
  );
}
