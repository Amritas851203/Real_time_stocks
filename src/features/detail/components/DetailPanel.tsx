'use client';

import React from 'react';
import { useUiStore } from '../../../store/useUiStore';
import { useStockStore } from '../../../store/useStockStore';
import Drawer from '../../../components/ui/Drawer';
import ChartContainer from '../../chart/components/ChartContainer';
import { Star, BarChart3, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function DetailPanel() {
  const { selectedSymbol, setSelectedSymbol } = useUiStore();
  const { stocksMap, watchlist, toggleWatchlist } = useStockStore();

  const stock = selectedSymbol ? stocksMap[selectedSymbol] : null;

  if (!stock) return null;

  const isStarred = watchlist.includes(stock.symbol);
  const isPositive = stock.changePercent >= 0;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Determine market cap tier description
  let capTier = 'Small Cap';
  if (stock.marketCap > 200e9) capTier = 'Mega Cap';
  else if (stock.marketCap > 10e9) capTier = 'Large Cap';
  else if (stock.marketCap > 2e9) capTier = 'Mid Cap';

  // Stats array for grid display
  const stats = [
    { label: 'Market Cap', value: formatCurrency(stock.marketCap), icon: DollarSign },
    { label: 'P/E Ratio', value: stock.peRatio !== null ? stock.peRatio.toFixed(2) : 'Unprofitable', icon: Activity },
    { label: 'EPS', value: `${stock.eps.toFixed(2)}`, icon: BarChart3 },
    { label: 'Daily Volume', value: formatCompact(stock.volume), icon: TrendingUp },
    { label: '52W High', value: formatCurrency(stock.high52), icon: TrendingUp, color: 'text-emerald-400' },
    { label: '52W Low', value: formatCurrency(stock.low52), icon: TrendingDown, color: 'text-rose-400' },
  ];

  return (
    <Drawer
      isOpen={selectedSymbol !== null}
      onClose={() => setSelectedSymbol(null)}
      title={`${stock.symbol} - Detailed Analysis`}
      size="xl"
    >
      <div className="space-y-6 select-none text-xs">
        
        {/* Company Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-black text-gray-100 tracking-wider">{stock.symbol}</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                {stock.sector}
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-bold border border-sky-500/20">
                {capTier}
              </span>
            </div>
            <p className="text-gray-400 font-semibold">{stock.name}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-100">
                {formatCurrency(stock.price)}
              </div>
              <div
                className={`font-semibold flex items-center justify-end ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </div>
            </div>

            {/* Watchlist toggle */}
            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              className={`p-2.5 rounded-lg border transition-all duration-200 ${
                isStarred
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-[#0d1117] border-[#30363d] text-gray-500 hover:text-white hover:border-[#8b949e]/30'
              }`}
              title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Candlestick Chart */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-1">Interactive Candlestick Chart</h2>
          <ChartContainer stock={stock} />
        </div>

        {/* Financial Metrics Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-1">Financial & Market Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-[#161b22]/40 border border-[#30363d]/50 rounded-xl p-3 flex items-center space-x-3"
                >
                  <div className="p-2 rounded-lg bg-[#0d1117] text-gray-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block font-bold">{stat.label}</span>
                    <span className={`text-xs font-bold text-gray-200 ${stat.color || ''}`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Description Overview */}
        <div className="space-y-2 bg-[#161b22]/30 border border-[#30363d]/30 rounded-xl p-4 leading-relaxed">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Company Profile Summary</h2>
          <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
            {stock.name} is a leading enterprise operating in the <span className="text-gray-300 font-semibold">{stock.sector}</span> sector. 
            With a current market valuation of <span className="text-gray-300 font-semibold">{formatCurrency(stock.marketCap)}</span> ({capTier}), 
            the stock commands a significant presence in its market tier. The price is currently trading at <span className="text-gray-300 font-semibold">{formatCurrency(stock.price)}</span>, 
            which is positioned between its 52-week low of <span className="text-gray-400 font-semibold">{formatCurrency(stock.low52)}</span> and high of <span className="text-gray-400 font-semibold">{formatCurrency(stock.high52)}</span>. 
            {stock.peRatio !== null ? (
              <span> The company exhibits a P/E multiple of <span className="text-gray-300 font-semibold">{stock.peRatio.toFixed(2)}</span> with an annual Earnings Per Share (EPS) of <span className="text-gray-300 font-semibold">${stock.eps.toFixed(2)}</span>.</span>
            ) : (
              <span> Under current earnings statements, the firm is unprofitable, posting negative Earnings Per Share (EPS) of <span className="text-rose-400 font-semibold">${stock.eps.toFixed(2)}</span>.</span>
            )}
            {' '}Real-time updates continue to track daily transactions and volume movements (averaging {formatCompact(stock.volume)} shares/day) under connection websocket listeners.
          </p>
        </div>

      </div>
    </Drawer>
  );
}
