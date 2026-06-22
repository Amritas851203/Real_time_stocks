'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { LineChart as ChartIcon, Star, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { generateHistoricalData } from '../../../utils/mockDataGenerator';

// ── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const fmtC = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtP = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

// ── Sparkline chart ──────────────────────────────────────────────────────────
function SparklineChart({ candles, positive }: { candles: { close: number }[]; positive: boolean }) {
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
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#chart-grad)" points={fill} />
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
        <span className="text-xs font-bold text-gray-250">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-[#1f2937]/20 pt-3">{children}</div>}
    </div>
  );
}

const TFS = ['1D','1W','1M','3M','6M','1Y','ALL'] as const;
type TF = typeof TFS[number];
const TF_COUNTS: Record<TF, number> = { '1D': 1, '1W': 5, '1M': 22, '3M': 66, '6M': 132, '1Y': 252, 'ALL': 9999 };

export default function MobileChartsPage() {
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const showToast = useUiStore((s) => s.showToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [tf, setTf] = useState<TF>('1M');

  // Filter stocks based on search query
  const autocompleteStocks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [stocks, searchQuery]);

  // Selected Stock
  const stock = useMemo(() => {
    if (selectedSymbol) {
      return stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
    }
    return stocks[0];
  }, [stocks, selectedSymbol]);

  const fullHistory = useMemo(() => {
    if (!stock) return [];
    return generateHistoricalData(stock.symbol, stock.price, 300);
  }, [stock?.symbol, stock?.price]);

  const candles = useMemo(() => fullHistory.slice(-TF_COUNTS[tf]), [fullHistory, tf]);
  const isPos = (stock?.changePercent ?? 0) >= 0;
  const inWL = stock ? watchlist.includes(stock.symbol) : false;

  // Technical rating
  const rating = (() => {
    if (!stock) return null;
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

  const metrics = stock ? [
    { label: 'Market Cap',    value: fmtC(stock.marketCap) },
    { label: 'Volume',        value: fmtC(stock.volume) },
    { label: 'P/E Ratio',     value: stock.peRatio != null ? stock.peRatio.toFixed(1) : 'N/A' },
    { label: 'EPS',           value: stock.eps != null ? fmt(stock.eps) : 'N/A' },
    { label: '52W High',      value: fmt(stock.high52) },
    { label: '52W Low',       value: fmt(stock.low52) },
  ] : [];

  // Mock indicators
  const indicators = useMemo(() => {
    if (!stock) return null;
    const hash = [...stock.symbol].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
    const rsi = 30 + (Math.abs(hash) % 41);
    const macd = ((Math.abs(hash % 100) - 50) / 10).toFixed(2);
    const sma20 = (stock.price * (0.97 + (Math.abs(hash) % 6) * 0.01)).toFixed(2);
    const ema20 = (stock.price * (0.98 + (Math.abs(hash) % 4) * 0.01)).toFixed(2);
    const bbUpper = (stock.price * 1.03).toFixed(2);
    const bbLower = (stock.price * 0.97).toFixed(2);
    return { rsi, macd, sma20, ema20, bbUpper, bbLower };
  }, [stock]);

  if (!stock) {
    return (
      <div className="flex flex-col bg-[#050816] min-h-full items-center justify-center p-8 text-center text-xs text-gray-500">
        No stock loaded yet. Please wait.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-8">
      {/* Header Panel */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1f2937]/20 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-white">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase leading-none">Chart Analysis</h1>
            <p className="text-[9px] text-gray-550 font-bold mt-1">Interactive indicator monitors & candle overlays</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Search / Selector */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol (e.g. AAPL, TSLA)..."
            className="w-full bg-[#0B1220] border border-[#1f2937]/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
          />
          {autocompleteStocks.length > 0 && (
            <div className="absolute top-11 left-0 right-0 rounded-2xl bg-[#111827] border border-[#1f2937]/60 shadow-2xl p-2.5 z-30 space-y-1">
              {autocompleteStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    setSelectedSymbol(s.symbol);
                    setSearchQuery('');
                    showToast(`Loaded chart for ${s.symbol}`, 'success');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-[#0B1220] transition-colors"
                >
                  <div>
                    <span className="text-xs font-black text-white block">{s.symbol}</span>
                    <span className="text-[9px] text-gray-550 block truncate max-w-[180px]">{s.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">{fmt(s.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Stock Info Banner */}
        <div className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/50 p-4 relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-white leading-tight">{stock.symbol}</span>
                <span className="text-[10px] text-gray-500 truncate max-w-[140px] block leading-tight">{stock.name}</span>
              </div>
              <p className="text-2xl font-black text-white tabular-nums mt-1">{fmt(stock.price)}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{fmtP(stock.changePercent)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => {
                  toggleWatchlist(stock.symbol);
                  showToast(inWL ? `Removed ${stock.symbol} from watchlist` : `Added ${stock.symbol} to watchlist`, 'info');
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#050816] border border-[#1f2937]/35 text-gray-500"
              >
                <Star className={`w-4 h-4 ${inWL ? 'fill-yellow-450 text-yellow-450 text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
              </button>
              {rating && (
                <span className={`text-[9px] font-black px-2 py-1 rounded-xl border leading-none ${rating.bg} ${rating.color}`}>
                  {rating.label}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[9px] text-gray-600 mb-1">
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

        {/* Chart View */}
        <div className="space-y-2">
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {TFS.map((t) => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border shrink-0 min-w-[40px] text-center ${
                  tf === t
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-550 border-[#1f2937]/30 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#0B1220]/50 border border-[#1f2937]/20 p-2">
            <SparklineChart candles={candles} positive={isPos} />
          </div>
          <div className="flex justify-between text-[9px] text-gray-650 mt-1 px-1">
            <span>{candles[0]?.time ?? ''}</span>
            <span>{candles[candles.length - 1]?.time ?? ''}</span>
          </div>
        </div>

        {/* Technical Indicators */}
        {indicators && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Technical Indicators</h3>

            <Accordion title={`RSI (14) — ${indicators.rsi.toFixed(0)}`}>
              <div className="space-y-2">
                <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${indicators.rsi < 30 ? 'bg-emerald-500' : indicators.rsi > 70 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${indicators.rsi}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                  <span className="text-emerald-450">Oversold (&lt;30)</span>
                  <span className={indicators.rsi < 30 ? 'text-emerald-400' : indicators.rsi > 70 ? 'text-rose-450' : 'text-yellow-405 text-yellow-400'}>
                    {indicators.rsi < 30 ? 'OVERSOLD' : indicators.rsi > 70 ? 'OVERBOUGHT' : 'NEUTRAL'}
                  </span>
                  <span className="text-rose-450">Overbought (&gt;70)</span>
                </div>
              </div>
            </Accordion>

            <Accordion title={`MACD — ${indicators.macd}`}>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-center">
                <div className="rounded-xl bg-[#050816] p-2">
                  <p className="text-[9px] text-gray-550 uppercase">MACD</p>
                  <p className={`font-black mt-0.5 ${Number(indicators.macd) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{indicators.macd}</p>
                </div>
                <div className="rounded-xl bg-[#050816] p-2">
                  <p className="text-[9px] text-gray-550 uppercase">Signal</p>
                  <p className="font-black text-white mt-0.5">{(Number(indicators.macd) * 0.9).toFixed(2)}</p>
                </div>
              </div>
            </Accordion>

            <Accordion title={`Moving Averages — SMA: $${indicators.sma20}`}>
              <div className="text-xs space-y-1.5 font-bold">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price vs SMA20</span>
                  <span className={stock.price > Number(indicators.sma20) ? 'text-emerald-400' : 'text-rose-400'}>
                    {stock.price > Number(indicators.sma20) ? 'Above SMA' : 'Below SMA'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EMA20</span>
                  <span className="text-white">${indicators.ema20}</span>
                </div>
              </div>
            </Accordion>
          </div>
        )}

        {/* Fundamentals */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fundamentals</h3>
          <div className="grid grid-cols-2 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl bg-[#0B1220]/40 border border-[#1f2937]/20 p-3">
                <p className="text-[9px] text-gray-555 font-bold uppercase tracking-wider text-gray-500">{m.label}</p>
                <p className="text-sm font-black text-white mt-0.5 truncate">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
