'use client';

import React, { useState } from 'react';

const INDICES = [
  { name: 'NIFTY 50', value: 22480.5, change: 0.43, color: 'from-blue-600 to-blue-800' },
  { name: 'SENSEX', value: 73958.2, change: 0.51, color: 'from-purple-600 to-purple-800' },
  { name: 'BANK NIFTY', value: 48120.8, change: -0.22, color: 'from-rose-600 to-rose-800' },
  { name: 'NIFTY IT', value: 37840.3, change: 1.12, color: 'from-emerald-600 to-emerald-800' },
];

export default function MarketCarousel() {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Market Overview</h2>
        <div className="flex space-x-1">
          {INDICES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-blue-400 w-4' : 'bg-gray-600 w-2'}`}
            />
          ))}
        </div>
      </div>
      {/* Horizontally scrollable row */}
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {INDICES.map((idx, i) => (
          <div
            key={idx.name}
            onClick={() => setActive(i)}
            style={{ scrollSnapAlign: 'center', flexShrink: 0, width: '80vw', maxWidth: '320px' }}
            className={`rounded-2xl bg-gradient-to-br ${idx.color} p-4 cursor-pointer transition-all duration-200 ${i === active ? 'ring-2 ring-white/20' : 'opacity-80'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white/70">{idx.name}</p>
                <p className="text-2xl font-black text-white mt-1">{idx.value.toLocaleString('en-IN')}</p>
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-lg ${idx.change >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="h-0.5 flex-1 rounded bg-white/20">
                <div
                  className={`h-full rounded ${idx.change >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(100, Math.abs(idx.change) * 30 + 40)}%` }}
                />
              </div>
              <span className="text-[10px] text-white/50">1D</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
