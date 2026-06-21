'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Coins, Globe, Flame } from 'lucide-react';

interface AssetOverview {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  type: 'index' | 'crypto' | 'commodity';
}

const INITIAL_ASSETS: AssetOverview[] = [
  { symbol: '^GSPC', name: 'S&P 500', price: 5487.03, changePercent: 0.25, type: 'index' },
  { symbol: '^IXIC', name: 'NASDAQ', price: 17721.59, changePercent: -0.03, type: 'index' },
  { symbol: 'FTSE', name: 'FTSE 100', price: 8205.12, changePercent: 0.45, type: 'index' },
  { symbol: 'GDAXI', name: 'DAX Index', price: 18132.85, changePercent: -0.12, type: 'index' },
  { symbol: 'N225', name: 'NIKKEI 225', price: 38632.75, changePercent: 0.85, type: 'index' },
  { symbol: 'BTCUSD', name: 'BTC/USD', price: 65412.50, changePercent: 1.45, type: 'crypto' },
  { symbol: 'ETHUSD', name: 'ETH/USD', price: 3512.20, changePercent: 2.10, type: 'crypto' },
  { symbol: 'CL1', name: 'Brent Crude', price: 85.24, changePercent: 0.52, type: 'commodity' },
  { symbol: 'GC1', name: 'Gold Spot', price: 2332.10, changePercent: -0.18, type: 'commodity' },
];

export default function Ticker() {
  const [assets, setAssets] = useState<AssetOverview[]>(INITIAL_ASSETS);

  useEffect(() => {
    // Tick prices slightly for dynamic live look
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          const variance = asset.type === 'crypto' ? 0.08 : 0.02; // crypto is volatile
          const changePct = (Math.random() - 0.49) * variance;
          const priceDelta = asset.price * (changePct / 100);
          return {
            ...asset,
            price: Number((asset.price + priceDelta).toFixed(2)),
            changePercent: Number((asset.changePercent + changePct).toFixed(2)),
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Duplicate items array to ensure flawless loop marquee transition
  const marqueeItems = [...assets, ...assets];

  const getIcon = (type: AssetOverview['type']) => {
    if (type === 'crypto') return <Coins className="w-3 h-3 text-yellow-500/80 mr-1" />;
    if (type === 'commodity') return <Flame className="w-3 h-3 text-orange-500/80 mr-1" />;
    return <Globe className="w-3 h-3 text-blue-500/80 mr-1" />;
  };

  return (
    <div className="w-full bg-[#050816] border-b border-[#1f2937]/50 text-[10px] py-1.5 px-4 select-none overflow-hidden relative z-40 flex items-center">
      <div className="flex items-center space-x-12 animate-marquee-slow whitespace-nowrap scrollbar-none">
        {marqueeItems.map((asset, idx) => {
          const isPositive = asset.changePercent >= 0;
          return (
            <div
              key={`${asset.symbol}-${idx}`}
              className="inline-flex items-center space-x-2 shrink-0 bg-[#0B1220]/60 border border-[#1f2937]/30 px-2.5 py-1 rounded-lg hover:border-blue-550/30 transition-colors"
            >
              {getIcon(asset.type)}
              <span className="text-gray-400 font-bold tracking-wider">{asset.name}</span>
              <span className="text-gray-200 font-black tabular-nums">
                {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center font-black ${
                  isPositive ? 'text-brand-emerald' : 'text-brand-negative'
                }`}
              >
                {isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
