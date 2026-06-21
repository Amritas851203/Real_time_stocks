'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import MarketCarousel from '../../components/mobile/MarketCarousel';
import DashboardCards from '../../components/mobile/DashboardCards';
import MobileStockCard from '../../components/mobile/StockCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function MobileHome() {
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);
  const initializeStocks = useStockStore((s) => s.initializeStocks);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'watchlist' | 'gainers' | 'losers'>('all');

  // Keep websocket alive for real-time updates
  useWebSocket();

  // Initialize stocks if empty
  useEffect(() => {
    if (stocks.length === 0) {
      initializeStocks();
    }
  }, [stocks.length, initializeStocks]);

  // Filter stocks for the mobile view
  const displayStocks = useMemo(() => {
    let list = stocks;

    // Apply tab filter
    if (activeTab === 'watchlist') {
      list = list.filter((s) => watchlist.includes(s.symbol));
    } else if (activeTab === 'gainers') {
      list = list.filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === 'losers') {
      list = list.filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [stocks, watchlist, activeTab, searchQuery]);

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'gainers', label: '▲ Gainers' },
    { id: 'losers', label: '▼ Losers' },
    { id: 'watchlist', label: '★ Watchlist' },
  ] as const;

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-[#f3f4f6] overflow-x-hidden">
      <div className="flex-1">
        <div className="p-3 space-y-4 pb-8">

          {/* Market Status Carousel */}
          <MarketCarousel />

          {/* Dashboard Cards 2×2 */}
          <DashboardCards />

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-[#0B1220]/80 border border-[#1f2937]/60 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
            />
          </div>

          {/* Tab Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 min-touch ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#0B1220] text-gray-400 border-[#1f2937]/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stock List */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Stocks ({displayStocks.length})
              </h2>
            </div>

            {stocks.length === 0 ? (
              /* Loading skeleton */
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-[#1f2937]/20 bg-[#0B1220]/40 p-3 h-20 animate-pulse" />
                ))}
              </div>
            ) : displayStocks.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                <p className="text-2xl mb-2">🔍</p>
                <p>No stocks match your filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayStocks.map((stock) => (
                  <MobileStockCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
