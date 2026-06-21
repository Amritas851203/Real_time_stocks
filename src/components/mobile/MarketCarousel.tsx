'use client';

import React, { useRef } from 'react';

const INDICES = [
  { name: 'NIFTY 50',   value: 22480.5,  change: 0.43,  points: '+96.5',  color: '#3b82f6', bg: 'from-blue-900/80 to-blue-950/90' },
  { name: 'SENSEX',     value: 73958.2,  change: 0.51,  points: '+375.2', color: '#a855f7', bg: 'from-purple-900/80 to-purple-950/90' },
  { name: 'BANK NIFTY', value: 48120.8,  change: -0.22, points: '-106.3', color: '#f43f5e', bg: 'from-rose-900/80 to-rose-950/90' },
  { name: 'NASDAQ',     value: 17156.4,  change: 0.92,  points: '+156.7', color: '#10b981', bg: 'from-emerald-900/80 to-emerald-950/90' },
  { name: 'DOW JONES',  value: 38680.1,  change: -0.08, points: '-30.9',  color: '#f59e0b', bg: 'from-amber-900/80 to-amber-950/90' },
];

// Tiny static sparkline for each card
const SPARKS: Record<string, string> = {
  'NIFTY 50':   '0,22 25,18 50,20 75,14 100,10 125,13 150,8',
  'SENSEX':     '0,20 25,16 50,19 75,13 100,15 125,10 150,8',
  'BANK NIFTY': '0,8  25,13 50,10 75,17 100,14 125,20 150,22',
  'NASDAQ':     '0,24 25,19 50,21 75,15 100,12 125,9  150,6',
  'DOW JONES':  '0,10 25,14 50,11 75,16 100,18 125,14 150,17',
};

export default function MarketCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Market Overview</h2>
        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span>Live</span>
        </span>
      </div>

      {/* Cards row — touch scrollable, no scrollbar visible */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-2"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {INDICES.map((idx) => {
          const pos = idx.change >= 0;
          return (
            <div
              key={idx.name}
              style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 'calc(85vw)', maxWidth: '320px' }}
              className={`bg-gradient-to-br ${idx.bg} border border-white/5 rounded-2xl p-4 relative overflow-hidden`}
            >
              {/* Glow accent */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
                style={{ background: idx.color }}
              />

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-white/60">{idx.name}</p>
                  <p className="text-2xl font-black text-white mt-0.5 tabular-nums">
                    {idx.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </p>
                </div>
                <div className={`text-right`}>
                  <span
                    className={`text-sm font-black px-2.5 py-1 rounded-xl ${pos ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
                  >
                    {pos ? '+' : ''}{idx.change.toFixed(2)}%
                  </span>
                  <p className={`text-[11px] font-bold mt-1 text-right ${pos ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                    {idx.points}
                  </p>
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="mt-3 h-10 relative z-10">
                <svg viewBox="0 0 150 30" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id={`g-${idx.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={idx.color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={idx.color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill={`url(#g-${idx.name})`}
                    points={`0,30 ${SPARKS[idx.name]} 150,30`}
                  />
                  <polyline
                    fill="none"
                    stroke={idx.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={SPARKS[idx.name]}
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between mt-1 relative z-10">
                <span className="text-[10px] text-white/30">NSE • 1D</span>
                <span className="text-[10px] text-white/30">Tap for details</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center space-x-1 mt-1.5">
        {INDICES.map((_, i) => (
          <div key={i} className={`h-1 rounded-full bg-gray-700 ${i === 0 ? 'w-4 bg-blue-500' : 'w-2'}`} />
        ))}
      </div>
    </div>
  );
}
