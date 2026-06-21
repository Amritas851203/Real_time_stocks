'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useWebSocket } from '../../../hooks/useWebSocket';
import MobileStockCard from '../../../components/mobile/StockCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Stock } from '../../../types';

const SECTORS = ['All', 'Technology', 'Financials', 'Healthcare', 'Energy', 'Industrials', 'Utilities', 'Consumer'];
type SortKey = 'change' | 'price' | 'volume' | 'marketCap' | 'pe';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'change',    label: '% Change' },
  { key: 'price',     label: 'Price' },
  { key: 'volume',    label: 'Volume' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'pe',        label: 'P/E Ratio' },
];

export default function ScreenerPage() {
  const stocks = useStockStore((s) => s.stocks);
  const initializeStocks = useStockStore((s) => s.initializeStocks);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('change');
  const [sortDesc, setSortDesc] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useWebSocket();
  useEffect(() => { if (stocks.length === 0) initializeStocks(); }, [stocks.length, initializeStocks]);

  const displayed = useMemo(() => {
    let list: Stock[] = stocks;
    if (sector !== 'All') list = list.filter(s => s.sector === sector);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'change':    av = a.changePercent; bv = b.changePercent; break;
        case 'price':     av = a.price;         bv = b.price;         break;
        case 'volume':    av = a.volume;         bv = b.volume;        break;
        case 'marketCap': av = a.marketCap;      bv = b.marketCap;     break;
        case 'pe':        av = a.peRatio ?? 0;   bv = b.peRatio ?? 0;  break;
        default:          return 0;
      }
      return sortDesc ? bv - av : av - bv;
    });
  }, [stocks, sector, search, sortKey, sortDesc]);

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#050816]/95 backdrop-blur-sm px-4 pt-3 pb-2 space-y-2 border-b border-[#1f2937]/20">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks..."
            className="w-full bg-[#0B1220] border border-[#1f2937]/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
          />
        </div>
        {/* Sort + filter row */}
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { if (sortKey === opt.key) setSortDesc(!sortDesc); else { setSortKey(opt.key); setSortDesc(true); } }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                sortKey === opt.key ? 'bg-[#1f2937] border-blue-500/30 text-white' : 'bg-transparent border-[#1f2937]/30 text-gray-500'
              }`}
            >
              {opt.label} {sortKey === opt.key ? (sortDesc ? '↓' : '↑') : ''}
            </button>
          ))}
        </div>
        {/* Sector filter (shown when filters toggled) */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  sector === s ? 'bg-blue-600 text-white border-blue-500' : 'bg-transparent text-gray-400 border-[#1f2937]/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2">
        <p className="text-[11px] text-gray-500 font-bold">{displayed.length} stocks found</p>
      </div>

      {/* Stock list */}
      <div className="px-4 space-y-2">
        {stocks.length === 0
          ? [...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-[#0B1220]/40 animate-pulse" />)
          : displayed.map(stock => <MobileStockCard key={stock.symbol} stock={stock} />)
        }
      </div>
    </div>
  );
}
