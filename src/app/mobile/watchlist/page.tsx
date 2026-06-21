'use client';

import React, { useMemo } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import MobileStockCard from '../../../components/mobile/StockCard';
import { Star, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WatchlistPage() {
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);
  const router = useRouter();

  const watchlistStocks = useMemo(
    () => stocks.filter((s) => watchlist.includes(s.symbol)),
    [stocks, watchlist]
  );

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1f2937]/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Watchlist</h1>
            <p className="text-xs text-gray-500">{watchlistStocks.length} stocks saved</p>
          </div>
          <button
            onClick={() => router.push('/mobile')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stocks
          </button>
        </div>
      </div>

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-base font-black text-white mb-1">No stocks saved yet</p>
          <p className="text-sm text-gray-500 text-center mb-4">
            Tap the Watchlist button on any stock card to save it here.
          </p>
          <button
            onClick={() => router.push('/mobile')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold"
          >
            Browse Stocks
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-2">
          {watchlistStocks.map((stock) => (
            <MobileStockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
}
