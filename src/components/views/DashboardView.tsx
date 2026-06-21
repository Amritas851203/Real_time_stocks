'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import { getMarketOverview } from '../../utils/mockDataGenerator';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Download, 
  RefreshCw, 
  ChevronRight,
  Flame,
  Star,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardView() {
  const { stocks, watchlist, cashBalance, holdings } = useStockStore();
  const { setDetailSymbol, setActiveView, showToast } = useUiStore();
  
  const [currentTime, setCurrentTime] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [indices, setIndices] = useState(getMarketOverview());

  // Update clock in real-time
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate subtle index changes to feel "live" on dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => 
        prev.map(idx => {
          const changePct = (Math.random() - 0.495) * 0.1; // small random moves
          const newPrice = Number((idx.price * (1 + changePct / 100)).toFixed(2));
          const newChange = Number((idx.change + (newPrice - idx.price)).toFixed(2));
          const newChangePct = Number((idx.changePercent + changePct).toFixed(2));
          return {
            ...idx,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats on stocks dataset
  const stats = useMemo(() => {
    if (stocks.length === 0) return null;
    let gainers = 0;
    let losers = 0;
    let totalVol = 0;

    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      if (s.changePercent > 0) gainers++;
      else if (s.changePercent < 0) losers++;
      totalVol += s.volume;
    }

    const ratio = (gainers / (gainers + losers || 1)) * 100;
    return { gainers, losers, totalVol, ratio };
  }, [stocks]);

  // Sector performance computation
  const sectorPerformances = useMemo(() => {
    const sectorGroups: Record<string, { totalChange: number; count: number }> = {};
    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      if (!sectorGroups[s.sector]) {
        sectorGroups[s.sector] = { totalChange: 0, count: 0 };
      }
      sectorGroups[s.sector].totalChange += s.changePercent;
      sectorGroups[s.sector].count++;
    }

    return Object.keys(sectorGroups).map(sectorName => {
      const avgChange = sectorGroups[sectorName].totalChange / sectorGroups[sectorName].count;
      return {
        name: sectorName,
        change: Number(avgChange.toFixed(2))
      };
    }).sort((a, b) => b.change - a.change);
  }, [stocks]);

  // Extract Top 5 Gainers, Losers, and Volume Leaders
  const dashboardMovers = useMemo(() => {
    if (stocks.length === 0) return null;
    const sortedByGain = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const sortedByLoss = [...stocks].sort((a, b) => a.changePercent - b.changePercent);
    const sortedByVol = [...stocks].sort((a, b) => b.volume - a.volume);
    
    return {
      gainers: sortedByGain.slice(0, 5),
      losers: sortedByLoss.slice(0, 5),
      active: sortedByVol.slice(0, 5)
    };
  }, [stocks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Dashboard terminal summary synchronized with WebSocket feed.', 'success');
    }, 800);
  };

  const handleExport = () => {
    const reportText = `ZETHETA ALPHA MARKET TERMINAL REPORT
Generated At: ${new Date().toISOString()}
------------------------------------------
Market Status: OPEN (Latency: 23ms)
Total Stocks Tracked: ${stocks.length}
Holdings Cash Balance: $${cashBalance.toLocaleString()}
Watchlist Count: ${watchlist.length}

MARKET BREADTH INDICATOR
-------------------------
Bullish Breadth: ${stats?.ratio.toFixed(2)}%
Gainers: ${stats?.gainers} | Losers: ${stats?.losers}

GLOBAL INDEX SUMMARY
--------------------
${indices.map(idx => `${idx.name} (${idx.symbol}): ${idx.price} (${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent}%)`).join('\n')}

SECTOR PERFORMANCE HEATMAP
--------------------------
${sectorPerformances.map(sec => `${sec.name}: ${sec.change >= 0 ? '+' : ''}${sec.change}%`).join('\n')}
------------------------------------------
END REPORT`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zetheta_market_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dashboard report downloaded successfully.', 'success');
  };

  const selectStock = (symbol: string) => {
    setDetailSymbol(symbol);
  };

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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Global Market Terminal</h1>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Institutional consolidated overview & live indices feeds</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Live Clock Card */}
          <div className="bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-[10px] font-black">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-400">MARKET TIME:</span>
            <span className="text-gray-200 font-mono tracking-wider">{currentTime || '00:00:00'}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-450 animate-ping ml-1" />
            <span className="text-emerald-400 text-[9px] tracking-widest uppercase">OPEN</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#0B1220] hover:bg-[#111827] border border-[#1f2937]/50 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Refresh Terminal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[9.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Indices Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {indices.map(idx => {
          const isPos = idx.changePercent >= 0;
          return (
            <div key={idx.symbol} className="glass-card p-3 rounded-xl border border-[#1f2937]/50 relative overflow-hidden group hover:border-[#1f2937] transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/2 rounded-full blur-md" />
              <div className="flex justify-between items-center pb-1">
                <span className="text-[10px] text-gray-400 font-black tracking-wide">{idx.name}</span>
                <span className="text-[8px] text-gray-550 font-bold">{idx.symbol}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-black text-gray-200 font-mono">{idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`text-[9px] font-black flex items-center ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                  {isPos ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                  {isPos ? '+' : ''}{idx.changePercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Core KPI cards */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 flex flex-col justify-between space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <Award className="w-4 h-4 text-blue-400 mr-1.5" />
            <span>Terminal Metrics</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#050816]/40 p-3 rounded-xl border border-gray-850">
              <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Stocks Tracked</span>
              <span className="text-xl font-black text-white leading-none mt-1.5 block">{stocks.length}</span>
              <span className="text-[7.5px] text-blue-400 font-bold block mt-1">+50 Active Real-time</span>
            </div>
            
            <div className="bg-[#050816]/40 p-3 rounded-xl border border-gray-850">
              <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Watchlist Stocks</span>
              <span className="text-xl font-black text-amber-400 leading-none mt-1.5 block">{watchlist.length}</span>
              <span className="text-[7.5px] text-gray-450 font-bold block mt-1">Bookmarked alerts enabled</span>
            </div>

            <div className="bg-[#050816]/40 p-3 rounded-xl border border-gray-850">
              <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Portfolio Value</span>
              <span className="text-xs font-black text-emerald-450 leading-none mt-1.5 block truncate">
                {formatCurrency(cashBalance + holdings.reduce((sum, h) => sum + h.shares * (stocks.find(s => s.symbol === h.symbol)?.price || h.buyPrice), 0))}
              </span>
              <span className="text-[7.5px] text-emerald-500 font-bold block mt-1">Live valuation synced</span>
            </div>

            <div className="bg-[#050816]/40 p-3 rounded-xl border border-gray-850">
              <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Active Ticks</span>
              <span className="text-xl font-black text-teal-400 leading-none mt-1.5 block">60 FPS</span>
              <span className="text-[7.5px] text-teal-400 font-bold block mt-1">High fidelity render loop</span>
            </div>
          </div>

          <div className="p-3 bg-[#0B1220]/60 rounded-xl border border-blue-500/10 flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-blue-550/15 border border-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-400">
              Ω
            </div>
            <div className="flex-1">
              <span className="text-[9.5px] text-gray-300 font-black block">Institutional Gateway Connected</span>
              <span className="text-[8px] text-gray-550 font-bold block">Latency: 23ms | Protocol: Secure WS Simulated</span>
            </div>
          </div>
        </div>

        {/* Market Breadth needle indicator */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 flex flex-col justify-between">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <Activity className="w-4 h-4 text-purple-400 mr-1.5" />
            <span>Market Breadth Needle</span>
          </h3>

          {stats && (
            <div className="flex flex-col items-center justify-center py-3">
              <div className="w-36 h-20 flex items-center justify-center relative">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10,48 A 40,40 0 0,1 90,48" fill="none" stroke="rgba(31, 41, 55, 0.8)" strokeWidth="6" strokeLinecap="round" />
                  <path
                    d="M 10,48 A 40,40 0 0,1 90,48"
                    fill="none"
                    stroke="url(#db-breadth-grad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="125"
                    strokeDashoffset={125 - (125 * stats.ratio) / 100}
                  />
                  <defs>
                    <linearGradient id="db-breadth-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  {/* Needle */}
                  {(() => {
                    const angle = -180 + (180 * stats.ratio) / 100;
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 36 * Math.cos(rad);
                    const y = 48 + 36 * Math.sin(rad);
                    return (
                      <line x1="50" y1="48" x2={x} y2={y} stroke="#f3f4f6" strokeWidth="2.5" strokeLinecap="round" />
                    );
                  })()}
                  <circle cx="50" cy="48" r="4.5" fill="#f3f4f6" />
                </svg>
              </div>

              <div className="text-center mt-2 space-y-0.5">
                <span className="text-sm font-black text-purple-400">{stats.ratio.toFixed(1)}% Bullish</span>
                <p className="text-[9px] text-gray-500 font-bold">
                  {stats.gainers.toLocaleString()} Advances vs {stats.losers.toLocaleString()} Declines
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-center text-[9px] pt-2 border-t border-[#1f2937]/30">
            <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-gray-500 font-bold block">Gainers</span>
              <span className="text-xs font-black text-emerald-400 mt-0.5 block">{stats?.gainers.toLocaleString()}</span>
            </div>
            <div className="p-1.5 rounded bg-rose-500/5 border border-rose-500/10">
              <span className="text-gray-500 font-bold block">Losers</span>
              <span className="text-xs font-black text-rose-400 mt-0.5 block">{stats?.losers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sector Heatmap Card */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 flex flex-col justify-between">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
            <Layers className="w-4 h-4 text-teal-400 mr-1.5" />
            <span>Sectors Heatmap</span>
          </h3>

          <div className="space-y-2 py-2 max-h-[160px] overflow-y-auto scrollbar-thin">
            {sectorPerformances.slice(0, 6).map(sec => {
              const isPos = sec.change >= 0;
              return (
                <div key={sec.name} className="space-y-1 text-[9.5px]">
                  <div className="flex justify-between font-bold text-gray-300">
                    <span>{sec.name}</span>
                    <span className={isPos ? 'text-brand-emerald' : 'text-brand-negative'}>
                      {isPos ? '+' : ''}{sec.change}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#050816] rounded-full overflow-hidden relative border border-gray-850">
                    <div 
                      className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ 
                        width: `${Math.min(100, Math.max(5, Math.abs(sec.change) * 20))}%`,
                        marginLeft: isPos ? '50%' : 'auto',
                        marginRight: isPos ? 'auto' : '50%',
                        position: 'absolute',
                        left: isPos ? '0' : 'auto',
                        right: isPos ? 'auto' : '0'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => {
              setActiveView('market');
            }}
            className="w-full text-center text-[9px] font-black text-blue-450 hover:underline pt-2 border-t border-[#1f2937]/30 uppercase flex items-center justify-center space-x-1"
          >
            <span>Full Heatmap Analysis</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Movers Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Gainers */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3">
          <h4 className="text-[10px] font-black text-emerald-450 uppercase tracking-widest flex items-center border-b border-[#1f2937]/30 pb-2">
            <TrendingUp className="w-4 h-4 mr-1.5" />
            <span>Top Gainers</span>
          </h4>
          <div className="space-y-1.5">
            {dashboardMovers?.gainers.map(st => (
              <div
                key={st.symbol}
                onClick={() => selectStock(st.symbol)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0B1220]/50 border border-gray-850 hover:bg-[#0B1220] transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{st.symbol}</span>
                  <span className="text-[9px] text-gray-500 truncate block max-w-[130px] font-bold">{st.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(st.price)}</span>
                  <span className="text-[9.5px] font-black text-brand-emerald tabular-nums">+{st.changePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3">
          <h4 className="text-[10px] font-black text-rose-450 uppercase tracking-widest flex items-center border-b border-[#1f2937]/30 pb-2">
            <TrendingDown className="w-4 h-4 mr-1.5" />
            <span>Top Losers</span>
          </h4>
          <div className="space-y-1.5">
            {dashboardMovers?.losers.map(st => (
              <div
                key={st.symbol}
                onClick={() => selectStock(st.symbol)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0B1220]/50 border border-gray-850 hover:bg-[#0B1220] transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{st.symbol}</span>
                  <span className="text-[9px] text-gray-500 truncate block max-w-[130px] font-bold">{st.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(st.price)}</span>
                  <span className="text-[9.5px] font-black text-brand-negative tabular-nums">{st.changePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Active */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3">
          <h4 className="text-[10px] font-black text-blue-450 uppercase tracking-widest flex items-center border-b border-[#1f2937]/30 pb-2">
            <Flame className="w-4 h-4 mr-1.5" />
            <span>Most Active Stocks</span>
          </h4>
          <div className="space-y-1.5">
            {dashboardMovers?.active.map(st => (
              <div
                key={st.symbol}
                onClick={() => selectStock(st.symbol)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0B1220]/50 border border-gray-850 hover:bg-[#0B1220] transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{st.symbol}</span>
                  <span className="text-[9px] text-gray-500 truncate block max-w-[130px] font-bold">Vol: {formatCompact(st.volume)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(st.price)}</span>
                  <span className={`text-[9.5px] font-black tabular-nums ${st.changePercent >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                    {st.changePercent >= 0 ? '+' : ''}{st.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
