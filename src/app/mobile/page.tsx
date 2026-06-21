'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import MarketCarousel from '../../components/mobile/MarketCarousel';
import DashboardCards from '../../components/mobile/DashboardCards';
import MobileStockCard from '../../components/mobile/StockCard';
import { Search } from 'lucide-react';
import { Stock } from '../../types';

const CHIPS = [
  { id: 'all',       label: 'All' },
  { id: 'gainers',   label: '▲ Gainers' },
  { id: 'losers',    label: '▼ Losers' },
  { id: 'volume',    label: '🔥 High Volume' },
  { id: 'large',     label: 'Large Cap' },
  { id: 'mid',       label: 'Mid Cap' },
  { id: 'small',     label: 'Small Cap' },
  { id: '52high',    label: '📈 52W High' },
  { id: 'breakout',  label: '⚡ Breakout' },
] as const;
type ChipId = typeof CHIPS[number]['id'];

function applyChipFilter(stocks: Stock[], chip: ChipId): Stock[] {
  switch (chip) {
    case 'gainers':   return [...stocks].filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    case 'losers':    return [...stocks].filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
    case 'volume':    return [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 100);
    case 'large':     return stocks.filter(s => s.marketCap > 10e9);
    case 'mid':       return stocks.filter(s => s.marketCap >= 2e9 && s.marketCap <= 10e9);
    case 'small':     return stocks.filter(s => s.marketCap < 2e9);
    case '52high':    return stocks.filter(s => s.price >= s.high52 * 0.97);
    case 'breakout':  return stocks.filter(s => s.changePercent > 2).sort((a, b) => b.changePercent - a.changePercent);
    default:          return stocks;
  }
}

export default function MobileHome() {
  const stocks = useStockStore((s) => s.stocks);
  const initializeStocks = useStockStore((s) => s.initializeStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<ChipId>('all');

  useWebSocket();

  useEffect(() => {
    if (stocks.length === 0) initializeStocks();
  }, [stocks.length, initializeStocks]);

  const displayStocks = useMemo(() => {
    let list = applyChipFilter(stocks, activeChip);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return list;
  }, [stocks, activeChip, searchQuery]);

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden">
      <div className="space-y-4 pb-6">

        {/* Section 1: Market Carousel */}
        <div className="pt-3">
          <MarketCarousel />
        </div>

        {/* Section 2: Overview 2×2 Cards */}
        <div className="px-4">
          <DashboardCards />
        </div>

        {/* Section 3: Search Bar */}
        <div className="px-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks, ETFs, sectors..."
              className="w-full bg-[#0B1220] border border-[#1f2937]/50 rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Section 4: Quick Filter Chips */}
        <div
          className="flex gap-2 px-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                activeChip === chip.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-[#0B1220] text-gray-400 border-[#1f2937]/40'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Section 5: Stock List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
              {activeChip === 'all' ? 'All Stocks' : CHIPS.find(c => c.id === activeChip)?.label}
              <span className="text-gray-600 ml-1.5">({displayStocks.length})</span>
            </h2>
          </div>

          {stocks.length === 0 ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#1f2937]/20 bg-[#0B1220]/40 h-24 animate-pulse" />
              ))}
            </div>
          ) : displayStocks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm text-gray-500">No stocks match</p>
              <button onClick={() => { setSearchQuery(''); setActiveChip('all'); }} className="mt-2 text-blue-400 text-xs font-bold">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayStocks.map((stock) => (
                <MobileStockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
