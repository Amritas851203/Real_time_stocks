'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Award, Star } from 'lucide-react';
import { useStockStore } from '../../store/useStockStore';

export default function DashboardCards() {
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);

  const gainers = stocks.filter((s) => s.changePercent > 0).length;
  const losers = stocks.filter((s) => s.changePercent < 0).length;

  const cards = [
    {
      label: 'Total Stocks',
      value: stocks.length.toLocaleString(),
      sub: '+50 added today',
      Icon: Award,
      border: 'border-l-blue-500',
      iconColor: 'text-blue-500/30',
      valueColor: 'text-white',
    },
    {
      label: 'Gainers',
      value: gainers.toLocaleString(),
      sub: `${((gainers / (stocks.length || 1)) * 100).toFixed(1)}% of market`,
      Icon: TrendingUp,
      border: 'border-l-emerald-500',
      iconColor: 'text-emerald-500/30',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'Losers',
      value: losers.toLocaleString(),
      sub: `${((losers / (stocks.length || 1)) * 100).toFixed(1)}% of market`,
      Icon: TrendingDown,
      border: 'border-l-rose-500',
      iconColor: 'text-rose-500/30',
      valueColor: 'text-rose-400',
    },
    {
      label: 'Watchlist',
      value: watchlist.length.toLocaleString(),
      sub: 'Saved stocks',
      Icon: Star,
      border: 'border-l-yellow-500',
      iconColor: 'text-yellow-500/30',
      valueColor: 'text-yellow-400',
    },
  ];

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl bg-[#0B1220]/60 border border-[#1f2937]/30 border-l-2 ${card.border} p-3`}
          >
            <card.Icon className={`absolute right-2 top-2 w-8 h-8 ${card.iconColor}`} />
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{card.label}</p>
            <p className={`text-xl font-black mt-0.5 ${card.valueColor}`}>{card.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
