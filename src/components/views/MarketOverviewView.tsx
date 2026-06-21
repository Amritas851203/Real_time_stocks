'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import { Globe, ShieldCheck, TrendingUp, TrendingDown, Layers, Activity } from 'lucide-react';

export default function MarketOverviewView() {
  const { stocks } = useStockStore();
  const { setDetailSymbol, showToast } = useUiStore();

  const [vix, setVix] = useState(14.25);
  const [vixChange, setVixChange] = useState(-0.15);

  // Tick VIX volatility index in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setVix(prev => {
        const change = (Math.random() - 0.5) * 0.2;
        setVixChange(Number(change.toFixed(2)));
        return Number(Math.max(8.0, Math.min(45.0, prev + change)).toFixed(2));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute sector statistics
  const sectorSummary = useMemo(() => {
    const sectors: Record<string, { totalCap: number; totalVol: number; changeSum: number; count: number; symbols: string[] }> = {};
    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      if (!sectors[s.sector]) {
        sectors[s.sector] = { totalCap: 0, totalVol: 0, changeSum: 0, count: 0, symbols: [] };
      }
      sectors[s.sector].totalCap += s.marketCap;
      sectors[s.sector].totalVol += s.volume;
      sectors[s.sector].changeSum += s.changePercent;
      sectors[s.sector].count++;
      if (sectors[s.sector].symbols.length < 3) {
        sectors[s.sector].symbols.push(s.symbol);
      }
    }

    return Object.keys(sectors).map(name => {
      const sec = sectors[name];
      const avgChange = sec.changeSum / sec.count;
      return {
        name,
        avgChange: Number(avgChange.toFixed(2)),
        totalCap: sec.totalCap,
        totalVol: sec.totalVol,
        symbols: sec.symbols
      };
    }).sort((a, b) => b.avgChange - a.avgChange);
  }, [stocks]);

  // Compute overall market breadth ratios
  const breadthStats = useMemo(() => {
    let advances = 0;
    let declines = 0;
    let totalVol = 0;

    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      if (s.changePercent > 0) advances++;
      else if (s.changePercent < 0) declines++;
      totalVol += s.volume;
    }

    const pct = (advances / (advances + declines || 1)) * 100;
    return { advances, declines, pct, totalVol };
  }, [stocks]);

  const selectStock = (sym: string) => {
    setDetailSymbol(sym);
  };

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Market Overview</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Global sector structures, exchange volumes, and volatility indexes</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          <span>VIX FEEDS SECURE</span>
        </div>
      </div>

      {/* Index Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        {/* Volatility Index */}
        <div className="glass-card p-3.5 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-purple-500 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">Volatility Index (VIX)</span>
            <span className="text-base font-black text-white font-mono block tabular-nums">{vix}</span>
          </div>
          <div className="text-right space-y-0.5">
            <span className={`text-xs font-black block tabular-nums ${vixChange >= 0 ? 'text-brand-negative' : 'text-brand-emerald'}`}>
              {vixChange >= 0 ? '+' : ''}{vixChange}%
            </span>
            <span className="text-[8px] text-gray-500 font-bold block">Market Fear Gauge</span>
          </div>
        </div>

        {/* Market Breadth */}
        <div className="glass-card p-3.5 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Exchange Breadth</span>
            <span className="text-[10px] font-black text-emerald-400 font-mono">{breadthStats.pct.toFixed(1)}% Advances</span>
          </div>
          <div className="h-2 w-full bg-[#050816] rounded-full overflow-hidden border border-gray-850 mt-1">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${breadthStats.pct}%` }} />
          </div>
        </div>

        {/* Exchange Volume */}
        <div className="glass-card p-3.5 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-blue-500 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Consolidated Volume</span>
            <span className="text-base font-black text-white font-mono block">{formatCompact(breadthStats.totalVol)} shares</span>
          </div>
          <Activity className="w-8 h-8 text-blue-500/10" />
        </div>
      </div>

      {/* Sector Map Title */}
      <div className="flex items-center space-x-1.5 px-1 shrink-0">
        <Layers className="w-4 h-4 text-teal-400" />
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector Performance TreeMap</h3>
      </div>

      {/* TreeMap grid */}
      <div className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {sectorSummary.map(sec => {
            const isPos = sec.avgChange >= 0;
            const bgClass = isPos
              ? 'from-[#050816] to-[#06241a] border-emerald-900/40 hover:border-emerald-805'
              : 'from-[#050816] to-[#2c0e13] border-rose-900/40 hover:border-rose-805';

            return (
              <div
                key={sec.name}
                className={`rounded-2xl p-4 border bg-gradient-to-br transition-all flex flex-col justify-between h-44 shadow-lg ${bgClass}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-gray-200 tracking-wide uppercase leading-normal max-w-[100px] truncate block">{sec.name}</span>
                    <span className={`text-[10px] font-black font-mono tabular-nums ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                      {isPos ? '+' : ''}{sec.avgChange}%
                    </span>
                  </div>
                  <div className="text-[8.5px] text-gray-500 font-bold mt-1 space-y-0.5">
                    <span>Val: {formatCompact(sec.totalCap)}</span>
                    <span className="block">Vol: {formatCompact(sec.totalVol)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-850/40 pt-3">
                  <span className="text-[7.5px] text-gray-550 font-black uppercase tracking-wider block">Top Equities</span>
                  <div className="flex space-x-1">
                    {sec.symbols.map(sym => (
                      <button
                        key={sym}
                        onClick={() => selectStock(sym)}
                        className="flex-1 py-1 rounded bg-[#050816]/80 hover:bg-[#050816] border border-gray-850 text-white font-extrabold text-[8px] font-mono tracking-wide cursor-pointer transition-all hover:scale-105"
                      >
                        {sym.split('_')[1] || sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
