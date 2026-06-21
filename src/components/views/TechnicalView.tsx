'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import { TrendingUp, ShieldCheck, Sliders, ChevronRight } from 'lucide-react';

interface TechIndicatorData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  macdLine: number;
  macdSignal: number;
  macdHist: number;
  ema20: number;
  ema50: number;
  goldenCrossScore: number; // Proximity crossing score
  high52: number;
  rating: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  ratingColor: string;
}

export default function TechnicalView() {
  const { stocks } = useStockStore();
  const { setDetailSymbol, showToast } = useUiStore();
  const [activePreset, setActivePreset] = useState<'all' | 'oversold' | 'overbought' | 'macdbull' | 'ema20' | 'goldencross' | 'breakout'>('all');

  // Deterministically compute technical indicators for each stock
  const computedTechStocks = useMemo(() => {
    return stocks.map(stock => {
      const s = stock.symbol;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
      }
      const uHash = Math.abs(hash);

      // 1. RSI (deterministic between 20 and 80)
      const baseRsi = 25 + (uHash % 51); // 25 to 75
      const changeEffect = (stock.changePercent * 3);
      const rsi = Math.min(95, Math.max(5, Number((baseRsi + changeEffect).toFixed(1))));

      // 2. EMA 20 & 50
      const ema20Mult = 0.95 + ((uHash % 100) / 1000); // 0.95 to 1.05
      const ema50Mult = 0.93 + ((uHash % 150) / 1500); // 0.93 to 1.03
      const ema20 = Number((stock.price * ema20Mult).toFixed(2));
      const ema50 = Number((stock.price * ema50Mult).toFixed(2));

      // 3. MACD
      const macdLine = Number(((uHash % 40) / 10 - 2).toFixed(2)); // -2 to +2
      const macdSignal = Number((macdLine * 0.85).toFixed(2));
      const macdHist = Number((macdLine - macdSignal).toFixed(2));

      // 4. Golden Cross
      const goldenCrossScore = Number(((uHash % 100)).toFixed(0)); // 0-100

      // 5. Technical Rating
      let buyPoints = 0;
      let sellPoints = 0;

      if (rsi < 35) buyPoints += 3;
      if (rsi > 65) sellPoints += 3;
      if (stock.price > ema20) buyPoints += 1;
      if (stock.price < ema20) sellPoints += 1;
      if (macdHist > 0.1) buyPoints += 2;
      if (macdHist < -0.1) sellPoints += 2;
      if (stock.changePercent > 2) buyPoints += 1;
      if (stock.changePercent < -2) sellPoints += 1;

      let rating: TechIndicatorData['rating'] = 'NEUTRAL';
      let ratingColor = 'bg-yellow-500/10 text-yellow-450 border-yellow-500/20';

      const diff = buyPoints - sellPoints;
      if (diff >= 4) {
        rating = 'STRONG BUY';
        ratingColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      } else if (diff >= 1) {
        rating = 'BUY';
        ratingColor = 'bg-emerald-500/5 text-emerald-450 border-emerald-550/10';
      } else if (diff <= -4) {
        rating = 'STRONG SELL';
        ratingColor = 'bg-rose-500/15 text-rose-400 border-rose-550/25';
      } else if (diff <= -1) {
        rating = 'SELL';
        ratingColor = 'bg-rose-500/5 text-rose-450 border-rose-550/10';
      }

      return {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        rsi,
        macdLine,
        macdSignal,
        macdHist,
        ema20,
        ema50,
        goldenCrossScore,
        high52: stock.high52,
        rating,
        ratingColor
      };
    });
  }, [stocks]);

  // Filter based on preset
  const filteredTechStocks = useMemo(() => {
    switch (activePreset) {
      case 'oversold':
        return computedTechStocks.filter(st => st.rsi < 30);
      case 'overbought':
        return computedTechStocks.filter(st => st.rsi > 70);
      case 'macdbull':
        return computedTechStocks.filter(st => st.macdHist > 0.3 && st.changePercent > 0.5);
      case 'ema20':
        return computedTechStocks.filter(st => st.price > st.ema20);
      case 'goldencross':
        return computedTechStocks.filter(st => st.goldenCrossScore > 85 && st.ema20 > st.ema50);
      case 'breakout':
        return computedTechStocks.filter(st => (st.high52 - st.price) / st.high52 < 0.02);
      case 'all':
      default:
        return computedTechStocks;
    }
  }, [computedTechStocks, activePreset]);

  const handleSelectPreset = (preset: typeof activePreset, label: string) => {
    setActivePreset(preset);
    showToast(`Preset: Applied scan filter for ${label}.`, 'info');
  };

  const handleSelectRow = (symbol: string) => {
    setDetailSymbol(symbol);
    showToast(`Inspection terminal loaded for ${symbol}.`, 'success');
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Technical Scanner</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Pre-calculated algorithms scan 5,000+ equities instantly</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          <span>ALGORITHMIC ENGINE ONLINE</span>
        </div>
      </div>

      {/* Preset Action Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0B1220]/60 p-2.5 rounded-2xl border border-[#1f2937]/40 shrink-0">
        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1.5 flex items-center space-x-1">
          <Sliders className="w-3 h-3 text-blue-400 mr-1" />
          <span>Preset Scans:</span>
        </div>
        {[
          { id: 'all', label: 'All Indicators' },
          { id: 'oversold', label: 'RSI Oversold (<30)' },
          { id: 'overbought', label: 'RSI Overbought (>70)' },
          { id: 'macdbull', label: 'MACD Bullish crossover' },
          { id: 'ema20', label: 'Price > EMA(20)' },
          { id: 'goldencross', label: 'Golden Cross Proximity' },
          { id: 'breakout', label: '52W Breakouts (<2% High)' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => handleSelectPreset(btn.id as any, btn.label)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold transition-all border cursor-pointer ${
              activePreset === btn.id
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                : 'bg-[#050816]/75 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Results summary stats */}
      <div className="flex justify-between items-center text-[10px] text-gray-450 font-bold px-1 shrink-0">
        <span>Displaying {filteredTechStocks.length.toLocaleString()} matching symbols</span>
        <span>Consolidated data latency: <strong className="text-emerald-450">Ticking Live</strong></span>
      </div>

      {/* Main Grid Viewport */}
      <div className="flex-1 min-h-0 bg-[#0B1220]/20 border border-[#1f2937]/50 rounded-2xl overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead className="sticky top-0 bg-[#050816] text-gray-400 font-black border-b border-[#1f2937]/50 z-10 select-none uppercase tracking-wider text-[9px]">
              <tr>
                <th className="p-3">Symbol</th>
                <th className="p-3">Company</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Change %</th>
                <th className="p-3 text-center">RSI (14)</th>
                <th className="p-3 text-center">MACD Histogram</th>
                <th className="p-3 text-right">EMA (20)</th>
                <th className="p-3 text-right">EMA (50)</th>
                <th className="p-3 text-center">Rating</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/35">
              {filteredTechStocks.slice(0, 100).map(st => {
                const isPos = st.changePercent >= 0;
                return (
                  <tr
                    key={st.symbol}
                    onClick={() => handleSelectRow(st.symbol)}
                    className="hover:bg-[#0B1220]/65 transition-colors cursor-pointer border-b border-[#1f2937]/20 group"
                  >
                    <td className="p-3 font-extrabold text-white tracking-wide">{st.symbol}</td>
                    <td className="p-3 font-bold text-gray-400 truncate max-w-[140px]">{st.name}</td>
                    <td className="p-3 text-right font-bold text-gray-200 tabular-nums">{formatCurrency(st.price)}</td>
                    <td className={`p-3 text-right font-black tabular-nums ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                      {isPos ? '+' : ''}{st.changePercent.toFixed(2)}%
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className={`px-1.5 py-0.5 rounded font-black ${
                        st.rsi < 30 ? 'bg-emerald-500/10 text-emerald-400' :
                        st.rsi > 70 ? 'bg-rose-500/10 text-rose-450' : 'text-gray-400'
                      }`}>
                        {st.rsi}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className={`font-black ${st.macdHist >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
                        {st.macdHist >= 0 ? '+' : ''}{st.macdHist}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-gray-450 tabular-nums">{formatCurrency(st.ema20)}</td>
                    <td className="p-3 text-right font-mono text-gray-450 tabular-nums">{formatCurrency(st.ema50)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full border text-[8.5px] font-black uppercase tracking-wider ${st.ratingColor}`}>
                        {st.rating}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-blue-400 hover:text-blue-300 font-extrabold flex items-center space-x-0.5 mx-auto group-hover:translate-x-0.5 transition-transform">
                        <span>Chart</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTechStocks.length === 0 && (
            <div className="p-12 text-center text-gray-600 font-bold text-xs uppercase tracking-wider select-none">
              No stocks match the applied technical scan conditions
            </div>
          )}
        </div>
        {filteredTechStocks.length > 100 && (
          <div className="p-2 border-t border-[#1f2937]/50 bg-[#050816]/90 text-center text-gray-550 text-[9px] font-black uppercase tracking-wider select-none">
            Showing top 100 matches. Refine your scan parameters to filter down further.
          </div>
        )}
      </div>
    </div>
  );
}
