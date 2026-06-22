'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStockStore } from '../../../../store/useStockStore';
import { ArrowLeft, Star, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { generateHistoricalData } from '../../../../utils/mockDataGenerator';

// ── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const fmtC = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtP = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

// ── Sparkline chart ──────────────────────────────────────────────────────────
function LineChart({ candles, positive }: { candles: { close: number }[]; positive: boolean }) {
  if (candles.length < 2) return <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No data</div>;
  const closes = candles.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const W = 300; const H = 100;
  const pts = closes.map((v, i) => `${((i / (closes.length - 1)) * W).toFixed(1)},${(H - ((v - min) / range) * H).toFixed(1)}`).join(' ');
  const fill = `0,${H} ${pts} ${W},${H}`;
  const color = positive ? '#10b981' : '#f43f5e';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#cg)" points={fill} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Accordion section ────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#1f2937]/30 bg-[#0B1220]/40 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold text-gray-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-[#1f2937]/20 pt-3">{children}</div>}
    </div>
  );
}

// ── Timeframes ────────────────────────────────────────────────────────────────
const TFS = ['1D','1W','1M','3M','6M','1Y','ALL'] as const;
type TF = typeof TFS[number];
const TF_COUNTS: Record<TF, number> = { '1D': 1, '1W': 5, '1M': 22, '3M': 66, '6M': 132, '1Y': 252, 'ALL': 9999 };

// ── Main ─────────────────────────────────────────────────────────────────────
export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string)?.toUpperCase();
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const [tf, setTf] = useState<TF>('1M');
  const stock = useMemo(() => stocks.find((s) => s.symbol === symbol), [stocks, symbol]);
  const fullHistory = useMemo(() => {
    if (!stock) return [];
    return generateHistoricalData(stock.symbol, stock.price, 300);
  }, [stock?.symbol, stock?.price]);
  const candles = useMemo(() => fullHistory.slice(-TF_COUNTS[tf]), [fullHistory, tf]);
  const isPos = (stock?.changePercent ?? 0) >= 0;
  const inWL = watchlist.includes(symbol);

  if (!stock) return (
    <div className="flex flex-col h-screen bg-[#050816] text-white items-center justify-center gap-3">
      <p className="text-gray-400">Stock not found</p>
      <button onClick={() => router.back()} className="text-blue-400 font-bold text-sm">← Go Back</button>
    </div>
  );

  // Technical rating
  const rating = (() => {
    let b = 0, s = 0;
    if (stock.changePercent > 1.5) b += 2; else if (stock.changePercent < -1.5) s += 2;
    const pos = (stock.price - stock.low52) / ((stock.high52 - stock.low52) || 1);
    if (pos > 0.75) b++; else if (pos < 0.25) s++;
    if (stock.peRatio && stock.peRatio < 20) b++; else if (stock.peRatio && stock.peRatio > 50) s++;
    const r = b / (b + s || 1);
    if (r > 0.7) return { label: 'STRONG BUY', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (r > 0.5) return { label: 'BUY', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (r < 0.3) return { label: 'STRONG SELL', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (r < 0.5) return { label: 'SELL', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20' };
    return { label: 'NEUTRAL', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
  })();

  const metrics = [
    { label: 'Market Cap',    value: fmtC(stock.marketCap) },
    { label: 'Volume',        value: fmtC(stock.volume) },
    { label: 'P/E Ratio',     value: stock.peRatio != null ? stock.peRatio.toFixed(1) : 'N/A' },
    { label: 'EPS',           value: stock.eps != null ? fmt(stock.eps) : 'N/A' },
    { label: 'ROE',           value: stock.roe != null ? fmtP(stock.roe) : 'N/A' },
    { label: 'Debt/Equity',   value: stock.debtEquity != null ? stock.debtEquity.toFixed(2) : 'N/A' },
    { label: 'Dividend',      value: stock.dividendYield != null ? fmtP(stock.dividendYield) : 'N/A' },
    { label: '52W High',      value: fmt(stock.high52) },
    { label: '52W Low',       value: fmt(stock.low52) },
    { label: 'Sector',        value: stock.sector },
  ];

  // Mock indicator values (deterministic from symbol hash)
  const hash = [...stock.symbol].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
  const rsi = 30 + (Math.abs(hash) % 41);
  const macd = ((Math.abs(hash % 100) - 50) / 10).toFixed(2);
  const sma20 = (stock.price * (0.97 + (Math.abs(hash) % 6) * 0.01)).toFixed(2);
  const ema20 = (stock.price * (0.98 + (Math.abs(hash) % 4) * 0.01)).toFixed(2);
  const bbUpper = (stock.price * 1.03).toFixed(2);
  const bbLower = (stock.price * 0.97).toFixed(2);

  return (
    <div className="flex flex-col bg-[#050816] text-[#f3f4f6] overflow-x-hidden min-h-screen">

      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-20 bg-[#050816]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-[#1f2937]/30">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0B1220] border border-[#1f2937]/30">
          <ArrowLeft className="w-4 h-4 text-gray-300" />
        </button>
        <div className="text-center">
          <p className="text-sm font-black text-white">{stock.symbol}</p>
          <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{stock.name}</p>
        </div>
        <button onClick={() => toggleWatchlist(stock.symbol)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0B1220] border border-[#1f2937]/30">
          <Star className={`w-4 h-4 ${inWL ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} />
        </button>
      </div>

      <div className="pb-8 space-y-0">

        {/* ── Price Section ── */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-black text-white tabular-nums">{fmt(stock.price)}</p>
              <div className={`flex items-center gap-1 mt-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-bold">{fmtP(stock.changePercent)} today</span>
              </div>
            </div>
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${rating.bg} ${rating.color}`}>
              {rating.label}
            </span>
          </div>

          {/* 52W range bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-600 mb-1">
              <span>52W Low {fmt(stock.low52)}</span>
              <span>52W High {fmt(stock.high52)}</span>
            </div>
            <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.max(2, Math.min(100, ((stock.price - stock.low52) / ((stock.high52 - stock.low52) || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="px-4">
          {/* Timeframe tabs */}
          <div className="flex space-x-1 mb-2">
            {TFS.map((t) => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${tf === t ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Chart container */}
          <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#0B1220]/50 border border-[#1f2937]/20 p-2">
            <LineChart candles={candles} positive={isPos} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-1">
            <span>{candles[0]?.time ?? ''}</span>
            <span>{candles[candles.length - 1]?.time ?? ''}</span>
          </div>
        </div>

        {/* ── Indicators Accordion ── */}
        <div className="px-4 pt-4 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Indicators</h3>

          <Accordion title={`RSI (14) — ${rsi.toFixed(0)}`}>
            <div className="space-y-2">
              <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${rsi < 30 ? 'bg-emerald-500' : rsi > 70 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${rsi}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span className="text-emerald-400">Oversold (&lt;30)</span>
                <span className={rsi < 30 ? 'text-emerald-400 font-bold' : rsi > 70 ? 'text-rose-400 font-bold' : 'text-yellow-400 font-bold'}>
                  {rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : 'NEUTRAL'}
                </span>
                <span className="text-rose-400">Overbought (&gt;70)</span>
              </div>
            </div>
          </Accordion>

          <Accordion title={`MACD — ${macd}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-[#050816] p-2">
                <p className="text-[10px] text-gray-500">MACD Line</p>
                <p className={`font-black ${Number(macd) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{macd}</p>
              </div>
              <div className="rounded-lg bg-[#050816] p-2">
                <p className="text-[10px] text-gray-500">Signal</p>
                <p className="font-black text-white">{(Number(macd) * 0.9).toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-[#050816] p-2 col-span-2">
                <p className="text-[10px] text-gray-500">Histogram</p>
                <p className={`font-black ${Number(macd) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{(Number(macd) * 0.1).toFixed(3)}</p>
              </div>
            </div>
          </Accordion>

          <Accordion title={`SMA (20) — $${sma20}`}>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Price vs SMA20</span>
                <span className={stock.price > Number(sma20) ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {stock.price > Number(sma20) ? '▲ Above' : '▼ Below'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SMA50</span>
                <span className="text-white font-bold">${(stock.price * 0.96).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SMA200</span>
                <span className="text-white font-bold">${(stock.price * 0.92).toFixed(2)}</span>
              </div>
            </div>
          </Accordion>

          <Accordion title={`EMA (20) — $${ema20}`}>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">EMA20</span>
                <span className="text-white font-bold">${ema20}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">EMA50</span>
                <span className="text-white font-bold">${(stock.price * 0.95).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Signal</span>
                <span className={stock.price > Number(ema20) ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {stock.price > Number(ema20) ? 'Bullish' : 'Bearish'}
                </span>
              </div>
            </div>
          </Accordion>

          <Accordion title="Bollinger Bands">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Upper Band</span>
                <span className="text-rose-300 font-bold">${bbUpper}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Middle (SMA20)</span>
                <span className="text-white font-bold">${sma20}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lower Band</span>
                <span className="text-emerald-300 font-bold">${bbLower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position</span>
                <span className="text-yellow-400 font-bold">
                  {stock.price > Number(bbUpper) ? 'Above Upper' : stock.price < Number(bbLower) ? 'Below Lower' : 'Inside Bands'}
                </span>
              </div>
            </div>
          </Accordion>
        </div>

        {/* ── Fundamentals ── */}
        <div className="px-4 pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Fundamentals</h3>
          <div className="grid grid-cols-2 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl bg-[#0B1220]/40 border border-[#1f2937]/20 p-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{m.label}</p>
                <p className="text-sm font-black text-white mt-0.5 truncate">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
