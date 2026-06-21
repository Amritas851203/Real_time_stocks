'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

function formatCurrency(num: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

function formatCompact(num: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(num);
}

interface StockCardProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    volume: number;
    marketCap: number;
  };
}

export default function MobileStockCard({ stock }: StockCardProps) {
  const router = useRouter();
  const isPositive = stock.changePercent >= 0;

  return (
    <div
      onClick={() => router.push(`/mobile/stock/${stock.symbol}`)}
      className="rounded-xl border border-[#1f2937]/30 bg-[#0B1220]/40 p-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Row 1: Symbol + Change Badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-black text-xs text-blue-400">
            {stock.symbol[0]}
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">{stock.symbol}</p>
            <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[140px]">{stock.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-white">{formatCurrency(stock.price)}</p>
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Row 2: Volume + Market Cap */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>Vol: {formatCompact(stock.volume)}</span>
        <span>Cap: {formatCompact(stock.marketCap)}</span>
      </div>

      {/* Mini Sparkline */}
      <div className="mt-2 h-8 w-full">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`spark-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={isPositive ? '#10b981' : '#f43f5e'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={isPositive ? '0,25 20,20 40,22 60,14 80,16 100,8' : '0,8 20,14 40,10 60,18 80,16 100,24'}
          />
          <polygon
            fill={`url(#spark-${stock.symbol})`}
            points={isPositive ? '0,25 20,20 40,22 60,14 80,16 100,8 100,30 0,30' : '0,8 20,14 40,10 60,18 80,16 100,24 100,30 0,30'}
          />
        </svg>
      </div>
    </div>
  );
}
