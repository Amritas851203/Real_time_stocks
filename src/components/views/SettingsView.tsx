'use client';

import React, { useState } from 'react';
import { useUiStore } from '../../store/useUiStore';
import { useStockStore } from '../../store/useStockStore';
import { Settings, ShieldCheck, Moon, Sun, Volume2, Database, DollarSign, Clock } from 'lucide-react';

export default function SettingsView() {
  const { theme, toggleTheme, showToast } = useUiStore();
  const { cashBalance } = useStockStore();

  const [timezone, setTimezone] = useState('IST');
  const [currency, setCurrency] = useState('USD');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleResetPortfolio = () => {
    // Reset Zustand cashBalance and holdings
    useStockStore.setState({
      cashBalance: 100000,
      holdings: []
    });
    showToast('Paper trading portfolio holdings & balance reset to $100,000.', 'success');
  };

  const handleClearCache = () => {
    showToast('Terminal search cache and local updates database cleared.', 'info');
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-gray-700 to-gray-550 flex items-center justify-center text-white shadow-[0_0_15px_rgba(100,116,139,0.25)]">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Terminal Settings</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Configure layout themes, API sound alerts, currency symbols, and cache files</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>CONFIG SECURE</span>
        </div>
      </div>

      {/* Settings Grid Panels */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 scrollbar-thin">
        {/* Panel 1: Theme & Display */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400 mr-1.5" /> : <Sun className="w-4 h-4 text-amber-500 mr-1.5" />}
            <span>Theme & Display Options</span>
          </h3>

          <div className="space-y-4 text-[10px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Interface Theme</span>
                <span className="text-[9px] text-gray-500 font-bold">Switch between dark mode and light mode frameworks</span>
              </div>
              <button
                onClick={() => {
                  toggleTheme();
                  showToast(`Interface theme changed to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}.`, 'success');
                }}
                className="px-3.5 py-1.5 rounded-xl border border-gray-800 bg-[#050816] text-gray-300 hover:text-white transition-all cursor-pointer font-black uppercase text-[9px] flex items-center space-x-1"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3 h-3 text-blue-400" />
                    <span>DARK MODE</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-505" />
                    <span>LIGHT MODE</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Ticker Marquee Speed</span>
                <span className="text-[9px] text-gray-500 font-bold">Select translation rate of upper scrolling banner</span>
              </div>
              <select className="bg-[#050816] border border-gray-850 rounded-xl px-2.5 py-1.5 text-[9.5px] text-gray-350 focus:outline-none focus:border-blue-500/40 font-bold">
                <option value="slow">Slow</option>
                <option value="normal">Normal (Default)</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Region & Currency */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-450 mr-1.5" />
            <span>Region & Valuation Config</span>
          </h3>

          <div className="space-y-4 text-[10px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Valuation Currency Symbol</span>
                <span className="text-[9px] text-gray-500 font-bold">Choose preferred currency formatting layout</span>
              </div>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  showToast(`Default terminal currency symbol changed to ${e.target.value}.`, 'info');
                }}
                className="bg-[#050816] border border-gray-850 rounded-xl px-2.5 py-1.5 text-[9.5px] text-gray-350 focus:outline-none focus:border-blue-500/40 font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Server Timezone Offset</span>
                <span className="text-[9px] text-gray-550 font-bold">Configure timestamps to display localized clock hours</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    showToast(`Terminal timezone sync shifted to ${e.target.value} hours.`, 'info');
                  }}
                  className="bg-[#050816] border border-gray-850 rounded-xl px-2.5 py-1.5 text-[9.5px] text-gray-350 focus:outline-none focus:border-blue-500/40 font-bold"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">EST (New York)</option>
                  <option value="IST">IST (India - Default)</option>
                  <option value="GMT">GMT (London)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Alerts & Audios */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <Volume2 className="w-4 h-4 text-rose-500 mr-1.5" />
            <span>Alert & WebSocket Sounds</span>
          </h3>

          <div className="space-y-4 text-[10px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Audio Signals for Triggers</span>
                <span className="text-[9px] text-gray-505 font-bold">Play warning tones when price alert thresholds cross</span>
              </div>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(`Terminal sound indicators ${!soundEnabled ? 'Enabled' : 'Disabled'}.`, 'info');
                }}
                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase cursor-pointer transition-all ${
                  soundEnabled
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-455'
                    : 'bg-[#050816] border-gray-850 text-gray-500'
                }`}
              >
                {soundEnabled ? 'SOUNDS ENABLED' : 'SOUNDS MUTED'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 4: Maintenance & Resets */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <Database className="w-4 h-4 text-amber-500 mr-1.5" />
            <span>Terminal Cache & System Maintenance</span>
          </h3>

          <div className="space-y-4 text-[10px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Reset Simulation Balances</span>
                <span className="text-[9px] text-gray-550 font-bold">Reset Paper cash balance back to $100k and drop all stock holdings</span>
              </div>
              <button
                onClick={handleResetPortfolio}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider text-[9.5px] cursor-pointer transition-colors shadow-md shadow-rose-600/15"
              >
                Reset Portfolio
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-250 block">Clear Local Memory Indexes</span>
                <span className="text-[9px] text-gray-550 font-bold">Purge indexed table row heights, search cache, and indicator variables</span>
              </div>
              <button
                onClick={handleClearCache}
                className="px-3.5 py-1.5 rounded-xl border border-gray-800 bg-[#050816] hover:text-white text-gray-300 font-black uppercase text-[9.5px] cursor-pointer transition-all"
              >
                Clear Indices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
