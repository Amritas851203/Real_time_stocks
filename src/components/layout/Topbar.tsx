'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { useWebSocketStore } from '../../store/useWebSocketStore';
import { useUiStore } from '../../store/useUiStore';
import { Search, Wifi, WifiOff, RefreshCw, Sun, Moon, Trash2, Bell, Shield } from 'lucide-react';

export default function Topbar() {
  const { searchQuery, setSearchQuery, resetFilters } = useFilterStore();
  const { status, connect, disconnect } = useWebSocketStore();
  const { theme, toggleTheme } = useUiStore();
  
  const [time, setTime] = useState('');

  // LiveClock for professional market dashboard appearance
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString('en-US', { hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectionToggle = () => {
    if (status === 'connected') {
      disconnect();
    } else if (status === 'disconnected') {
      connect();
    }
  };

  return (
    <header className="h-16 bg-[#050816] border-b border-[#1f2937]/50 flex items-center justify-between px-6 select-none sticky top-0 z-40">
      
      {/* Search Bar & Title Panel */}
      <div className="flex items-center flex-1 max-w-lg relative group">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ticker, company or sector... (Ctrl+K)"
          className="w-full bg-[#0B1220]/80 border border-[#1f2937]/60 rounded-xl py-2 pl-10 pr-12 text-xs text-gray-250 placeholder-gray-500 focus:outline-none focus:border-blue-500/40 focus:bg-[#0B1220] transition-all duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-10 text-xs text-gray-500 hover:text-white"
          >
            ×
          </button>
        ) : (
          <span className="absolute right-3.5 px-1.5 py-0.5 rounded bg-[#111827] border border-gray-800 text-[8px] font-bold text-gray-550 pointer-events-none select-none">
            Ctrl K
          </span>
        )}
      </div>

      {/* Center Section: Topbar Indices overview for density */}
      <div className="hidden lg:flex items-center space-x-6 mx-4">
        {/* NIFTY */}
        <div className="flex flex-col text-[10px]">
          <span className="text-gray-500 font-bold tracking-wider text-[8px] uppercase">NIFTY 50</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-gray-200">24,812.25</span>
            <span className="text-emerald-400 font-black text-[9px]">+1.35%</span>
          </div>
        </div>

        {/* SENSEX */}
        <div className="flex flex-col text-[10px]">
          <span className="text-gray-500 font-bold tracking-wider text-[8px] uppercase">SENSEX</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-gray-200">81,458.66</span>
            <span className="text-emerald-400 font-black text-[9px]">+1.28%</span>
          </div>
        </div>

        {/* BANK NIFTY */}
        <div className="flex flex-col text-[10px]">
          <span className="text-gray-500 font-bold tracking-wider text-[8px] uppercase">BANK NIFTY</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-gray-200">55,362.45</span>
            <span className="text-emerald-400 font-black text-[9px]">+1.65%</span>
          </div>
        </div>
      </div>

      {/* Right Section: Connections, Status, Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Market Live Clock */}
        <div className="flex items-center space-x-2 bg-[#0B1220] border border-[#1f2937]/50 px-3 py-1.5 rounded-xl text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-black tracking-wider uppercase">Market Open</span>
          <span className="text-gray-400 font-bold">|</span>
          <span className="text-gray-300 font-extrabold tabular-nums tracking-wide">{time || '00:00:00 AM'} IST</span>
        </div>

        {/* Reset Filters */}
        <button
          onClick={resetFilters}
          className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-[#0B1220] hover:bg-rose-950/20 text-gray-400 hover:text-rose-450 border border-[#1f2937]/50 hover:border-rose-500/20 text-[10px] font-bold transition-all duration-200 cursor-pointer"
          title="Reset Active Screener Filters"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Reset</span>
        </button>

        {/* WebSocket Connection Toggler */}
        <button
          onClick={handleConnectionToggle}
          disabled={status === 'reconnecting'}
          className={`inline-flex items-center px-2.5 py-1.5 rounded-xl border text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            status === 'connected'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-550/20'
              : status === 'reconnecting'
              ? 'bg-amber-505/10 text-amber-450 border-amber-500/20 animate-pulse cursor-not-allowed'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-550/20'
          }`}
          title={status === 'connected' ? 'Disconnect websocket' : 'Connect websocket'}
        >
          {status === 'connected' ? (
            <>
              <Wifi className="w-3.5 h-3.5 mr-1.5" />
              <span>Connected</span>
            </>
          ) : status === 'reconnecting' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              <span>Connecting</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 mr-1.5" />
              <span>Offline</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[#0B1220] hover:bg-[#111827] text-gray-400 hover:text-white transition-colors border border-[#1f2937]/50 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Notifications Icon */}
        <div className="relative cursor-pointer hover:text-white text-gray-400 p-2 bg-[#0B1220] border border-[#1f2937]/50 rounded-xl transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-[#050816]">
            3
          </span>
        </div>

        {/* User initials Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-blue-500/35 hover:scale-105 transition-transform cursor-pointer">
          A
        </div>

      </div>
    </header>
  );
}
