'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useStockStore } from '../../store/useStockStore';
import { Stock } from '../../types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}
function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export default function MobileStockCard({ stock }: { stock: Stock }) {
  const router = useRouter();
  const watchlist = useStockStore((s) => s.watchlist);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const inWatchlist = watchlist.includes(stock.symbol);
  const isPositive = stock.changePercent >= 0;

  // Sparkline from last ~20 candles
  const candles = stock.history?.slice(-20) ?? [];
  const closes = candles.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const sparkPoints = closes
    .map((v, i) => {
      const x = (i / Math.max(closes.length - 1, 1)) * 100;
      const y = 24 - ((v - min) / range) * 22;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const color = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/50 overflow-hidden">
      {/* Main row: tap to go to detail */}
      <button
        onClick={() => router.push(`/mobile/stock/${stock.symbol}`)}
        className="w-full text-left p-3"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20 flex items-center justify-center font-black text-sm text-blue-400 shrink-0">
            {stock.symbol.slice(0, 2)}
          </div>

          {/* Name + Symbol */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white leading-tight truncate">{stock.symbol}</p>
            <p className="text-[11px] text-gray-500 leading-tight truncate">{stock.name}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Vol {fmtCompact(stock.volume)} · Cap {fmtCompact(stock.marketCap)}
            </p>
          </div>

          {/* Sparkline */}
          <div className="w-16 h-7 shrink-0">
            {sparkPoints ? (
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparkPoints}
                />
              </svg>
            ) : null}
          </div>

          {/* Price + Change */}
          <div className="text-right shrink-0 ml-1">
            <p className="text-sm font-black text-white tabular-nums">{fmt(stock.price)}</p>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </button>

      {/* Action bar */}
      <div className="flex border-t border-[#1f2937]/20">
        <button
          onClick={() => router.push(`/mobile/stock/${stock.symbol}`)}
          className="flex-1 py-2 text-[11px] font-bold text-blue-400 hover:bg-blue-600/5 transition-colors"
        >
          Open Chart
        </button>
        <div className="w-px bg-[#1f2937]/30" />
        <button
          onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
          className={`flex-1 py-2 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
            inWatchlist ? 'text-yellow-400 hover:bg-yellow-500/5' : 'text-gray-500 hover:bg-white/5'
          }`}
        >
          <Plus className="w-3 h-3" />
          {inWatchlist ? 'Watchlisted' : 'Watchlist'}
        </button>
      </div>
    </div>
  );
}
