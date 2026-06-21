'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import ChartContainer from '../../features/chart/components/ChartContainer';
import { LineChart, Search, Eye, Sparkles, Activity } from 'lucide-react';

export default function ChartsView() {
  const { stocks, stocksMap } = useStockStore();
  const { selectedSymbol, setSelectedSymbol, activeIndicators, toggleIndicator, showToast } = useUiStore();
  const [searchVal, setSearchVal] = useState('');

  // Fallback to first stock if none is active
  const activeStock = useMemo(() => {
    const sym = selectedSymbol || (stocks.length > 0 ? stocks[0].symbol : '');
    return stocksMap[sym] || null;
  }, [selectedSymbol, stocksMap, stocks]);

  // Suggested results matching search
  const searchSuggestions = useMemo(() => {
    if (!searchVal) return [];
    return stocks.filter(s => 
      s.symbol.toUpperCase().includes(searchVal.toUpperCase()) || 
      s.name.toUpperCase().includes(searchVal.toUpperCase())
    ).slice(0, 5);
  }, [searchVal, stocks]);

  const selectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchVal('');
    showToast(`Loaded ${sym} historical charts.`, 'success');
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-full">
      {/* Top Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]">
            <LineChart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Chart Analysis Terminal</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Full-screen high-frequency candle charts & technical indicator overlays</p>
          </div>
        </div>

        {/* Quick Ticker Search */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search chart symbol (e.g. TECH_APEX)..."
            className="w-full bg-[#0B1220] border border-[#1f2937]/60 rounded-xl py-1.5 pl-8.5 pr-8 text-[10px] text-gray-250 placeholder-gray-500 focus:outline-none focus:border-blue-500/40 uppercase font-mono font-bold"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-2.5 top-1.5 text-xs text-gray-500 hover:text-white"
            >
              ×
            </button>
          )}

          {searchSuggestions.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl z-40 divide-y divide-[#1f2937]/40 text-[9.5px]">
              {searchSuggestions.map(st => (
                <button
                  key={st.symbol}
                  onClick={() => selectSymbol(st.symbol)}
                  className="w-full px-3 py-2 text-left hover:bg-[#0B1220] transition-colors flex justify-between items-center cursor-pointer"
                >
                  <span className="font-extrabold font-mono text-white">{st.symbol}</span>
                  <span className="text-gray-500 truncate max-w-[130px] font-bold">{st.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeStock ? (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
          {/* Main Chart Canvas (takes up most width) */}
          <div className="flex-1 min-h-0 bg-[#0B1220]/20 border border-[#1f2937]/50 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-[#1f2937]/30 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-black text-[9.5px] text-blue-400">
                  Ω
                </span>
                <div>
                  <span className="text-xs font-black text-white font-mono tracking-wide">{activeStock.symbol}</span>
                  <span className="text-[9px] text-gray-500 block font-bold mt-0.5">{activeStock.name} • {activeStock.sector}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-white font-mono">{formatCurrency(activeStock.price)}</span>
                <span className={`text-[9.5px] font-black block tabular-nums mt-0.5 ${
                  activeStock.changePercent >= 0 ? 'text-brand-emerald' : 'text-brand-negative'
                }`}>
                  {activeStock.changePercent >= 0 ? '+' : ''}{activeStock.changePercent}%
                </span>
              </div>
            </div>

            {/* High-fidelity TradingView Canvas */}
            <div className="flex-1 min-h-[350px] mt-4 relative">
              <ChartContainer stock={activeStock} />
            </div>
          </div>

          {/* Side Indicator Toolbar Panel */}
          <div className="w-full lg:w-64 shrink-0 space-y-4 overflow-y-auto scrollbar-none">
            {/* Indicator togglers */}
            <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
                <Activity className="w-4 h-4 text-blue-400 mr-1.5" />
                <span>Technical Overlays</span>
              </h3>

              <div className="space-y-3 text-[10px]">
                {[
                  { id: 'sma', label: 'Simple Moving Average (SMA 14)', color: 'text-blue-400', badgeClass: 'bg-blue-600/10 border-blue-505/30 text-blue-400' },
                  { id: 'ema', label: 'Exponential MA (EMA 20)', color: 'text-amber-400', badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-455' },
                  { id: 'bb', label: 'Bollinger Bands Envelopes', color: 'text-purple-400', badgeClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
                  { id: 'rsi', label: 'Relative Strength (RSI)', color: 'text-pink-400', badgeClass: 'bg-pink-500/10 border-pink-500/30 text-pink-400' }
                ].map(ind => {
                  const isActive = activeIndicators[ind.id as keyof typeof activeIndicators];
                  return (
                    <div key={ind.id} className="flex items-center justify-between py-1 border-b border-[#1f2937]/20">
                      <span className="text-gray-400 font-bold">{ind.label}</span>
                      <button
                        onClick={() => toggleIndicator(ind.id as any)}
                        className={`text-[8.5px] px-2 py-0.5 rounded font-black border transition-all cursor-pointer ${
                          isActive ? ind.badgeClass : 'bg-transparent border-gray-805 text-gray-500'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick insights card */}
            <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3">
              <div className="flex items-center space-x-1 text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Historical Trend</span>
              </div>
              <p className="text-[9.5px] text-gray-450 leading-relaxed font-semibold">
                Trading volume for {activeStock.symbol} has averaged consistent levels relative to its 52-week boundaries of {formatCurrency(activeStock.low52)} and {formatCurrency(activeStock.high52)}. Toggle overlays to verify support channels.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-550 uppercase tracking-widest font-black text-xs">
          Loading charts terminal...
        </div>
      )}
    </div>
  );
}
