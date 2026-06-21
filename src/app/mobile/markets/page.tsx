'use client';

import React, { useMemo } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}
function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

const SECTORS = ['Technology','Financials','Healthcare','Energy','Industrials','Utilities','Consumer'];

export default function MarketsPage() {
  const stocks = useStockStore((s) => s.stocks);
  const router = useRouter();

  const { gainers, losers, active, breadth, sectorPerf } = useMemo(() => {
    if (stocks.length === 0) return { gainers: [], losers: [], active: [], breadth: 50, sectorPerf: [] };
    const g = stocks.filter(s => s.changePercent > 0);
    const l = stocks.filter(s => s.changePercent < 0);
    return {
      gainers: [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10),
      losers:  [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10),
      active:  [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 10),
      breadth: Math.round((g.length / (stocks.length || 1)) * 100),
      sectorPerf: SECTORS.map(sec => {
        const ss = stocks.filter(s => s.sector === sec);
        const avg = ss.reduce((sum, s) => sum + s.changePercent, 0) / (ss.length || 1);
        return { sector: sec, avg, count: ss.length };
      }).sort((a, b) => b.avg - a.avg),
    };
  }, [stocks]);

  const [tab, setTab] = React.useState<'gainers' | 'losers' | 'active' | 'sectors'>('gainers');
  const tabList = tab === 'gainers' ? gainers : tab === 'losers' ? losers : active;

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-black text-white">Market Overview</h1>
        <p className="text-xs text-gray-500">{stocks.length} stocks tracked</p>
      </div>

      {/* Market Breadth */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl bg-[#0B1220]/60 border border-[#1f2937]/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-black text-gray-300 uppercase tracking-wider">Market Breadth</span>
            </div>
            <span className={`text-sm font-black ${breadth > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {breadth}% Bullish
            </span>
          </div>
          {/* Breadth bar */}
          <div className="h-3 bg-[#1f2937] rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full rounded-l-full transition-all" style={{ width: `${breadth}%` }} />
            <div className="bg-rose-500 h-full rounded-r-full flex-1" />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
            <span>{gainers.length > 0 ? stocks.filter(s=>s.changePercent>0).length : '—'} Gainers</span>
            <span>{losers.length > 0 ? stocks.filter(s=>s.changePercent<0).length : '—'} Losers</span>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="px-4 mb-3">
        <div className="flex bg-[#0B1220] rounded-xl p-1 gap-1">
          {[
            { id: 'gainers', label: '▲ Gainers' },
            { id: 'losers',  label: '▼ Losers' },
            { id: 'active',  label: '🔥 Active' },
            { id: 'sectors', label: '📊 Sectors' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                tab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-2">
        {tab === 'sectors' ? (
          sectorPerf.map(({ sector, avg, count }) => (
            <div key={sector} className="rounded-xl bg-[#0B1220]/40 border border-[#1f2937]/20 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{sector}</p>
                <p className="text-[10px] text-gray-500">{count} stocks</p>
              </div>
              <span className={`text-sm font-black ${avg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {avg >= 0 ? '+' : ''}{avg.toFixed(2)}%
              </span>
            </div>
          ))
        ) : (
          tabList.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => router.push(`/mobile/stock/${stock.symbol}`)}
              className="w-full flex items-center justify-between rounded-xl bg-[#0B1220]/40 border border-[#1f2937]/20 p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stock.symbol}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{fmt(stock.price)}</p>
                <span className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
