'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Ticker from '../components/layout/Ticker';
import StockTable from '../features/screener/components/StockTable';
import FilterDrawer from '../features/screener/components/FilterDrawer';
import ChartContainer from '../features/chart/components/ChartContainer';
import Toast from '../components/ui/Toast';
import Drawer from '../components/ui/Drawer';
import { useStocks } from '../hooks/useStocks';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUiStore } from '../store/useUiStore';
import { useStockStore } from '../store/useStockStore';
import { useFilterStore } from '../store/useFilterStore';
import {
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Flame,
  TrendingUp,
  Activity,
  DollarSign,
  PieChart,
  Eye,
  History,
  TrendingDown,
  ChevronDown,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Search,
  Star
} from 'lucide-react';

const QUICK_SECTORS = [
  'All Sectors',
  'Technology',
  'Financials',
  'Healthcare',
  'Energy',
  'Industrials',
  'Utilities'
];

export default function Home() {
  const { displayStocks, rawStocks, watchlist } = useStocks();
  
  console.log('[DEBUG] Home: render. displayStocks.length =', displayStocks.length, 'rawStocks.length =', rawStocks.length, 'selectedSymbol =', useUiStore.getState().selectedSymbol);

  // Ui Store Selectors
  const activeView = useUiStore((s) => s.activeView);
  const selectedSymbol = useUiStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useUiStore((s) => s.setSelectedSymbol);
  const activeIndicators = useUiStore((s) => s.activeIndicators);
  const toggleIndicator = useUiStore((s) => s.toggleIndicator);
  const showToast = useUiStore((s) => s.showToast);

  // Stock Store Selectors
  const recentlyViewed = useStockStore((s) => s.recentlyViewed);
  const addRecentlyViewed = useStockStore((s) => s.addRecentlyViewed);
  const recentUpdates = useStockStore((s) => s.recentUpdates);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  
  // Filter Store Selectors
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const selectedSectors = useFilterStore((s) => s.selectedSectors);
  const setSelectedSectors = useFilterStore((s) => s.setSelectedSectors);
  const marketCapCategory = useFilterStore((s) => s.marketCapCategory);
  const setMarketCapCategory = useFilterStore((s) => s.setMarketCapCategory);
  const priceRange = useFilterStore((s) => s.priceRange);
  const setPriceRange = useFilterStore((s) => s.setPriceRange);
  const peRange = useFilterStore((s) => s.peRange);
  const setPeRange = useFilterStore((s) => s.setPeRange);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeSectorTab, setActiveSectorTab] = useState('All Sectors');
  const [activeDropdown, setActiveDropdown] = useState<'sector' | 'mcap' | 'pe' | 'price' | null>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  // Launch live simulated websocket ticks
  useWebSocket();

  // Autoselect first stock on mount so charts are fully populated immediately
  useEffect(() => {
    console.log('[DEBUG] Home useEffect: displayStocks.length =', displayStocks.length, 'selectedSymbol =', selectedSymbol);
    if (displayStocks.length > 0 && !selectedSymbol) {
      console.log('[DEBUG] Home useEffect: auto-selecting first stock =', displayStocks[0].symbol);
      setSelectedSymbol(displayStocks[0].symbol);
      addRecentlyViewed(displayStocks[0].symbol);
    }
  }, [displayStocks, selectedSymbol, setSelectedSymbol, addRecentlyViewed]);

  // Sync sector quick selection tab with selectedSectors store state
  useEffect(() => {
    if (selectedSectors.length === 0) {
      setActiveSectorTab('All Sectors');
    } else if (selectedSectors.length === 1) {
      setActiveSectorTab(selectedSectors[0]);
    } else {
      setActiveSectorTab('');
    }
  }, [selectedSectors]);

  // Handle sector pill click - applies direct sector filtering
  const handleQuickSectorSelect = (sector: string) => {
    setActiveSectorTab(sector);
    if (sector === 'All Sectors') {
      setSelectedSectors([]);
    } else {
      setSelectedSectors([sector]);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute live market diagnostics
  const statsSummary = useMemo(() => {
    if (rawStocks.length === 0) return null;

    let gainers = 0;
    let losers = 0;
    let unchanged = 0;
    let topGainer = rawStocks[0];
    let topLoser = rawStocks[0];
    let volumeLeader = rawStocks[0];

    for (let i = 0; i < rawStocks.length; i++) {
      const stock = rawStocks[i];
      if (stock.changePercent > 0) {
        gainers++;
      } else if (stock.changePercent < 0) {
        losers++;
      } else {
        unchanged++;
      }

      if (stock.changePercent > topGainer.changePercent) {
        topGainer = stock;
      }
      if (stock.changePercent < topLoser.changePercent) {
        topLoser = stock;
      }
      if (stock.volume > volumeLeader.volume) {
        volumeLeader = stock;
      }
    }

    const breadthRatio = (gainers / (gainers + losers || 1)) * 100;

    return { gainers, losers, unchanged, topGainer, topLoser, volumeLeader, breadthRatio };
  }, [rawStocks]);

  // Sidebar stock lists: Top Gainers, Top Losers, and Volume Active
  const widgetLists = useMemo(() => {
    if (rawStocks.length === 0) return null;

    const sortedByGain = [...rawStocks].sort((a, b) => b.changePercent - a.changePercent);
    const sortedByLoss = [...rawStocks].sort((a, b) => a.changePercent - b.changePercent);
    const sortedByVolume = [...rawStocks].sort((a, b) => b.volume - a.volume);

    return {
      gainers: sortedByGain.slice(0, 5),
      losers: sortedByLoss.slice(0, 5),
      active: sortedByVolume.slice(0, 5),
    };
  }, [rawStocks]);

  // Selected Stock metadata selectors
  const activeStock = useMemo(() => {
    if (!selectedSymbol) return null;
    return rawStocks.find((s) => s.symbol === selectedSymbol) || null;
  }, [selectedSymbol, rawStocks]);

  // Dynamic Technical Indicators Rating Heuristics (Buy / Sell needle gauge)
  const technicalAnalysisRating = useMemo(() => {
    if (!activeStock) return { score: 50, rating: 'NEUTRAL', color: 'text-yellow-450' };
    
    // Compute deterministically based on stock metrics for mock depth
    let buyPoints = 0;
    let sellPoints = 0;

    // RSI criteria
    let rsiVal = 50;
    const s = activeStock.symbol;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
    }
    rsiVal = 30 + (Math.abs(hash) % 41); // deterministic RSI value 30 to 70

    if (rsiVal < 38) buyPoints += 2;
    else if (rsiVal > 62) sellPoints += 2;

    // Price change criteria
    if (activeStock.changePercent > 1.5) buyPoints += 2;
    else if (activeStock.changePercent < -1.5) sellPoints += 2;

    // Price proximity to 52w range bounds
    const rangeHeight = activeStock.high52 - activeStock.low52 || 1;
    const relativePos = (activeStock.price - activeStock.low52) / rangeHeight;
    if (relativePos > 0.8) buyPoints += 1;
    else if (relativePos < 0.2) sellPoints += 1;

    const total = buyPoints + sellPoints || 1;
    const buyRatio = buyPoints / total;

    let rating = 'NEUTRAL';
    let color = 'text-yellow-400';
    let score = 50;

    if (buyRatio > 0.7) {
      rating = 'STRONG BUY';
      color = 'text-emerald-450';
      score = 85;
    } else if (buyRatio > 0.5) {
      rating = 'BUY';
      color = 'text-emerald-400';
      score = 65;
    } else if (buyRatio < 0.3) {
      rating = 'STRONG SELL';
      color = 'text-rose-500';
      score = 15;
    } else if (buyRatio < 0.5) {
      rating = 'SELL';
      color = 'text-rose-400';
      score = 35;
    }

    return { score, rating, color };
  }, [activeStock]);

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

  // Check if any filter has been changed from default to render chips
  const activeFilterChips = useMemo(() => {
    const chips: { type: string; label: string; clear: () => void }[] = [];

    if (selectedSectors.length > 0) {
      chips.push({
        type: 'sector',
        label: `Sectors (${selectedSectors.length})`,
        clear: () => setSelectedSectors([]),
      });
    }
    if (marketCapCategory !== 'All') {
      chips.push({
        type: 'mcap',
        label: `Cap: ${marketCapCategory}`,
        clear: () => setMarketCapCategory('All'),
      });
    }
    if (priceRange.min > 0 || priceRange.max < 5000) {
      chips.push({
        type: 'price',
        label: `Price: $${priceRange.min}-$${priceRange.max}`,
        clear: () => setPriceRange({ min: 0, max: 5000 }),
      });
    }
    if (peRange.min > 0 || peRange.max < 120) {
      chips.push({
        type: 'pe',
        label: `P/E: ${peRange.min}-${peRange.max}`,
        clear: () => setPeRange({ min: 0, max: 120 }),
      });
    }
    return chips;
  }, [selectedSectors, marketCapCategory, priceRange, peRange, setSelectedSectors, setMarketCapCategory, setPriceRange, setPeRange]);

  const toggleSectorSelection = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#050816] text-[#f3f4f6] overflow-hidden select-none font-sans">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar />

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Rolling ticker marquee */}
        <Ticker />

        {/* Top Header bar */}
        <Topbar />

        {/* Inner Grid Canvas */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#0B1220]/20">
          
          {/* Workspace scrollable viewport */}
          <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4 overflow-y-auto scrollbar-thin">
            
            {/* Top Row: Metric Overview Cards */}
            {statsSummary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
                {/* Metric 1: Total Stocks */}
                <div className="glass-card p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-blue-500 relative overflow-hidden group">
                  <div className="space-y-0.5 z-10">
                    <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Total Stocks</span>
                    <span className="text-base font-black text-white">{rawStocks.length.toLocaleString()}</span>
                    <span className="text-[8px] text-blue-400 font-bold block">+50 added today</span>
                  </div>
                  <Award className="w-8 h-8 text-blue-500/20 absolute right-3 top-3 group-hover:scale-115 transition-transform" />
                </div>

                {/* Metric 2: Gainers Count */}
                <div className="glass-card p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-emerald-500 relative overflow-hidden group">
                  <div className="space-y-0.5 z-10">
                    <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Gainers</span>
                    <span className="text-base font-black text-emerald-400">{statsSummary.gainers.toLocaleString()}</span>
                    <span className="text-[8px] text-emerald-500 font-bold block">
                      {((statsSummary.gainers / rawStocks.length) * 100).toFixed(1)}% of market
                    </span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500/20 absolute right-3 top-3 group-hover:scale-115 transition-transform" />
                </div>

                {/* Metric 3: Losers Count */}
                <div className="glass-card p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-rose-500 relative overflow-hidden group">
                  <div className="space-y-0.5 z-10">
                    <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Losers</span>
                    <span className="text-base font-black text-rose-400">{statsSummary.losers.toLocaleString()}</span>
                    <span className="text-[8px] text-rose-500 font-bold block">
                      {((statsSummary.losers / rawStocks.length) * 100).toFixed(1)}% of market
                    </span>
                  </div>
                  <TrendingDown className="w-8 h-8 text-rose-500/20 absolute right-3 top-3 group-hover:scale-115 transition-transform" />
                </div>

                {/* Metric 4: Market Breadth Gauge */}
                <div className="glass-card p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-purple-500 relative overflow-hidden">
                  <div className="space-y-0.5 z-10">
                    <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Market Breadth</span>
                    <span className="text-xs font-black text-purple-400 flex items-center">
                      {(statsSummary.gainers / statsSummary.losers).toFixed(2)} G/L Ratio
                    </span>
                    <span className="text-[8px] text-gray-450 font-bold block">
                      {statsSummary.breadthRatio.toFixed(0)}% Bullish
                    </span>
                  </div>

                  {/* Circular visual needle gauge */}
                  <div className="w-16 h-10 flex items-center justify-center absolute right-2 bottom-1.5">
                    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                      <path d="M 10,48 A 40,40 0 0,1 90,48" fill="none" stroke="rgba(31, 41, 55, 0.8)" strokeWidth="6" strokeLinecap="round" />
                      <path
                        d="M 10,48 A 40,40 0 0,1 90,48"
                        fill="none"
                        stroke="url(#breadth-grad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="125"
                        strokeDashoffset={125 - (125 * Math.min(statsSummary.breadthRatio, 100)) / 100}
                      />
                      <defs>
                        <linearGradient id="breadth-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="50%" stopColor="#EAB308" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                      {/* Needle */}
                      {(() => {
                        const angle = -180 + (180 * statsSummary.breadthRatio) / 100;
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
                </div>

                {/* Metric 5: Exchange live diagnostic */}
                <div className="glass-card p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-teal-500 relative overflow-hidden group">
                  <div className="space-y-0.5 z-10">
                    <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Feed Latency</span>
                    <span className="text-base font-black text-teal-400">23 ms</span>
                    <span className="text-[8px] text-emerald-500 font-bold block inline-flex items-center">
                      <span className="w-1 h-1 rounded-full bg-emerald-450 animate-ping mr-1" />
                      1.0s Refresh rate
                    </span>
                  </div>
                  <Activity className="w-8 h-8 text-teal-500/20 absolute right-3 top-3 group-hover:scale-115 transition-transform" />
                </div>
              </div>
            )}

            {/* Middle Section: Advanced inline filter bar */}
            <div className="glass-panel p-3 rounded-2xl flex flex-col space-y-2.5 shrink-0 border border-[#1f2937]/50 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 relative z-30">
                {/* Advanced filter button & Input */}
                <div className="flex items-center space-x-2.5 flex-1 min-w-[280px]">
                  <button
                    onClick={() => setFilterDrawerOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters ({activeFilterChips.length})</span>
                  </button>

                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Instant filter by stock name/ticker..."
                      className="w-full bg-[#0B1220]/80 border border-[#1f2937]/60 rounded-xl py-1.5 pl-8.5 pr-8 text-[11px] text-gray-250 placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1.5 text-xs text-gray-500 hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline filter dropdown items */}
                <div className="flex items-center space-x-2">
                  
                  {/* Dropdown 1: Sector */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === 'sector' ? null : 'sector');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        selectedSectors.length > 0
                          ? 'bg-blue-605/10 border-blue-500/35 text-blue-400'
                          : 'bg-[#0B1220] border-[#1f2937]/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>Sector</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    
                    {activeDropdown === 'sector' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111827] border border-[#1f2937]/75 shadow-2xl p-3 z-30 space-y-2"
                      >
                        <h4 className="text-[10px] font-black text-gray-400 uppercase border-b border-[#1f2937]/50 pb-1.5">Select Sectors</h4>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                          {QUICK_SECTORS.slice(1).map((sec) => (
                            <label key={sec} className="flex items-center space-x-2 text-[10px] font-bold text-gray-300 hover:text-white cursor-pointer py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedSectors.includes(sec)}
                                onChange={() => toggleSectorSelection(sec)}
                                className="rounded border-gray-800 bg-[#050816] text-blue-500 focus:ring-blue-500/50 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>{sec}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown 2: Market Cap */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === 'mcap' ? null : 'mcap');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        marketCapCategory !== 'All'
                          ? 'bg-blue-605/10 border-blue-500/35 text-blue-400'
                          : 'bg-[#0B1220] border-[#1f2937]/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>Market Cap</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdown === 'mcap' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-[#1f2937]/75 shadow-2xl p-2 z-30"
                      >
                        <div className="flex flex-col space-y-1">
                          {(['All', 'Mega', 'Large', 'Mid', 'Small'] as const).map((tier) => (
                            <button
                              key={tier}
                              onClick={() => {
                                setMarketCapCategory(tier);
                                setActiveDropdown(null);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-left text-[10px] font-bold hover:bg-[#0B1220] transition-colors cursor-pointer ${
                                marketCapCategory === tier ? 'text-blue-400 font-black' : 'text-gray-400'
                              }`}
                            >
                              {tier} {tier !== 'All' ? 'Cap' : 'Tiers'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown 3: PE Ratio */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === 'pe' ? null : 'pe');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        peRange.min > 0 || peRange.max < 120
                          ? 'bg-blue-605/10 border-blue-500/35 text-blue-400'
                          : 'bg-[#0B1220] border-[#1f2937]/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>P/E Ratio</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdown === 'pe' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-[#1f2937]/75 shadow-2xl p-2 z-30"
                      >
                        <div className="flex flex-col space-y-1">
                          {[
                            { label: 'All ratios', min: 0, max: 120 },
                            { label: 'Under 15 (Value)', min: 0, max: 15 },
                            { label: '15 to 30 (Fair)', min: 15, max: 30 },
                            { label: '30 to 50 (Growth)', min: 30, max: 50 },
                            { label: 'Over 50 (High spec)', min: 50, max: 120 },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setPeRange({ min: item.min, max: item.max });
                                setActiveDropdown(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left text-[10px] font-bold hover:bg-[#0B1220] text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown 4: Price */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === 'price' ? null : 'price');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        priceRange.min > 0 || priceRange.max < 5000
                          ? 'bg-blue-605/10 border-blue-500/35 text-blue-400'
                          : 'bg-[#0B1220] border-[#1f2937]/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>Price</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdown === 'price' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-[#1f2937]/75 shadow-2xl p-2 z-30"
                      >
                        <div className="flex flex-col space-y-1">
                          {[
                            { label: 'All Prices', min: 0, max: 5000 },
                            { label: 'Under $10', min: 0, max: 10 },
                            { label: '$10 to $50', min: 10, max: 50 },
                            { label: '$50 to $200', min: 50, max: 200 },
                            { label: 'Over $200', min: 200, max: 5000 },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setPriceRange({ min: item.min, max: item.max });
                                setActiveDropdown(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left text-[10px] font-bold hover:bg-[#0B1220] text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reset filters */}
                  <button
                    onClick={resetFilters}
                    className="text-rose-400 hover:text-rose-350 text-[10px] font-black cursor-pointer px-2 py-1 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Sector Quick Filter Chips Row */}
              <div className="flex items-center justify-between border-t border-[#1f2937]/30 pt-2 shrink-0">
                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none flex-1 py-0.5">
                  {QUICK_SECTORS.map((sector) => {
                    const isActive = activeSectorTab === sector;
                    return (
                      <button
                        key={sector}
                        onClick={() => handleQuickSectorSelect(sector)}
                        className={`px-3 py-1 rounded-full text-[9px] font-extrabold transition-all border duration-200 shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-blue-600/10 text-blue-400 border-blue-500/35'
                            : 'bg-[#0B1220] text-gray-500 border-gray-800/80 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        {sector}
                      </button>
                    );
                  })}
                </div>

                {/* Display active filter chips badge */}
                {activeFilterChips.length > 0 && (
                  <div className="flex items-center space-x-1.5 ml-3 border-l border-gray-800 pl-3">
                    {activeFilterChips.map((chip) => (
                      <span
                        key={chip.type}
                        className="inline-flex items-center space-x-1 bg-[#111827] border border-[#1f2937]/50 text-gray-400 text-[8.5px] font-bold px-2 py-0.5 rounded-lg hover:border-rose-500/20 hover:text-rose-450 transition-colors"
                      >
                        <span>{chip.label}</span>
                        <button
                          onClick={chip.clear}
                          className="hover:text-white font-extrabold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Table Grid viewport (Middle Section) */}
            <div className="h-[340px] flex flex-col shrink-0 min-h-0">
              <StockTable displayStocks={displayStocks} />
            </div>

            {/* 5. Bottom Section: Candle chart, technical overlays and stats */}
            {activeStock ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0 pt-2 border-t border-[#1f2937]/40">
                {/* Column 1: Company Profile & Statistics (Left, 25% width) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Summary</h3>
                    <span className="text-[9px] font-bold text-gray-550">{activeStock.symbol}</span>
                  </div>

                  <div className="glass-card p-4 rounded-xl space-y-4 border border-[#1f2937]/50 relative overflow-hidden group">
                    {/* Visual header stats */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#1f2937]/50">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <span className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-black text-[9px] text-blue-400">
                            {activeStock.symbol.substring(0, 1)}
                          </span>
                          <span className="font-extrabold text-sm text-white tracking-wider">{activeStock.symbol}</span>
                        </div>
                        <span className="text-[9.5px] text-gray-500 font-bold block truncate max-w-[130px]">{activeStock.name}</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-sm font-black text-gray-150 block tabular-nums">{formatCurrency(activeStock.price)}</span>
                        <span
                          className={`text-[10px] font-black block tabular-nums ${
                            activeStock.changePercent >= 0 ? 'text-brand-emerald' : 'text-brand-negative'
                          }`}
                        >
                          {activeStock.changePercent >= 0 ? '+' : ''}
                          {activeStock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Day / 52W sliding range indicators */}
                    <div className="space-y-3 pt-0.5 text-[9.5px]">
                      {/* Day range slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-gray-500 font-bold">
                          <span>Day Range</span>
                          <span className="text-gray-300 tabular-nums">
                            {formatCurrency(activeStock.price * 0.99)} - {formatCurrency(activeStock.price * 1.01)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0B1220] rounded-full overflow-hidden relative border border-[#1f2937]/30">
                          <div className="h-full bg-blue-600 rounded-full w-24 absolute left-12" />
                        </div>
                      </div>

                      {/* 52W range slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-gray-500 font-bold">
                          <span>52W Boundaries</span>
                          <span className="text-gray-300 tabular-nums">
                            {formatCurrency(activeStock.low52)} - {formatCurrency(activeStock.high52)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0B1220] rounded-full overflow-hidden relative border border-[#1f2937]/30">
                          {(() => {
                            const pct = Math.min(
                              100,
                              Math.max(
                                0,
                                ((activeStock.price - activeStock.low52) / (activeStock.high52 - activeStock.low52 || 1)) * 100
                              )
                            );
                            return (
                              <div
                                style={{ left: `${Math.max(0, pct - 5)}%` }}
                                className="h-2 w-2 rounded-full bg-emerald-400 absolute -top-0.5 border border-[#050816]"
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider block">Market Cap</span>
                        <span className="text-xs font-black text-gray-200 tabular-nums">{formatCompact(activeStock.marketCap)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider block">P/E Ratio</span>
                        <span className="text-xs font-black text-gray-200 tabular-nums">
                          {activeStock.peRatio !== null ? activeStock.peRatio.toFixed(1) : 'Unprofitable'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider block">EPS</span>
                        <span className="text-xs font-black text-gray-200 tabular-nums">${activeStock.eps.toFixed(2)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider block">Volume</span>
                        <span className="text-xs font-black text-gray-200 tabular-nums">{formatCompact(activeStock.volume)}</span>
                      </div>
                    </div>

                    {/* Description narration */}
                    <div className="pt-3 border-t border-[#1f2937]/50 text-[10px] text-gray-400 leading-relaxed font-medium">
                      <p className="line-clamp-3">
                        {activeStock.name} commands a market cap of{' '}
                        <span className="text-gray-300 font-semibold">{formatCurrency(activeStock.marketCap)}</span>. 
                        It is trading in a 52-week boundary of{' '}
                        {formatCurrency(activeStock.low52)} and {formatCurrency(activeStock.high52)} in the {activeStock.sector} industry.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2 & 3: Main Candlestick Chart Area (Middle, 50% width) */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <PieChart className="w-3.5 h-3.5 text-blue-450 mr-1.5" />
                      <span>{activeStock.symbol} Candlestick Analysis</span>
                    </h3>
                    <span className="text-[9px] text-gray-500 font-bold">{activeStock.name}</span>
                  </div>
                  <ChartContainer stock={activeStock} />
                </div>

                {/* Column 4: Technical Indicators checklist and status (Right, 25% width) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Technical Rating</h3>
                    <span className="text-[9px] font-black text-emerald-450 flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      SECURE FEED
                    </span>
                  </div>

                  <div className="glass-card p-4 rounded-xl space-y-4 border border-[#1f2937]/50 flex flex-col justify-between h-[360px]">
                    {/* Gauge needle block */}
                    <div className="flex flex-col items-center text-center space-y-1 relative">
                      <span className="text-[8px] text-gray-550 font-black uppercase tracking-wider">AGGREGATE INDICATOR STATUS</span>
                      
                      {/* circular rating gauge */}
                      <div className="w-24 h-16 flex items-center justify-center mt-2 relative">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                          <path d="M 10,48 A 40,40 0 0,1 90,48" fill="none" stroke="rgba(31, 41, 55, 0.8)" strokeWidth="6" strokeLinecap="round" />
                          <path
                            d="M 10,48 A 40,40 0 0,1 90,48"
                            fill="none"
                            stroke="url(#tech-rating-grad)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="125"
                            strokeDashoffset={125 - (125 * technicalAnalysisRating.score) / 100}
                          />
                          <defs>
                            <linearGradient id="tech-rating-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#EF4444" />
                              <stop offset="25%" stopColor="#EF4444" />
                              <stop offset="50%" stopColor="#EAB308" />
                              <stop offset="75%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                          </defs>
                          {/* Needle */}
                          {(() => {
                            const angle = -180 + (180 * technicalAnalysisRating.score) / 100;
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

                      <span className={`text-sm font-black mt-2 uppercase ${technicalAnalysisRating.color}`}>
                        {technicalAnalysisRating.rating}
                      </span>
                      <span className="text-[8.5px] text-gray-500 font-bold">Composite indicators rating score of {technicalAnalysisRating.score}/100</span>
                    </div>

                    {/* Indicator parameter toggles */}
                    <div className="space-y-1.5 border-t border-[#1f2937]/50 pt-3 flex-1 overflow-y-auto scrollbar-none">
                      <div className="flex items-center justify-between text-[10px] py-0.5">
                        <span className="text-gray-450 font-bold">SMA (14) Proximity</span>
                        <button
                          onClick={() => toggleIndicator('sma')}
                          className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                            activeIndicators.sma
                              ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                              : 'bg-transparent border-gray-800 text-gray-500'
                          }`}
                        >
                          {activeIndicators.sma ? 'ACTIVE' : 'DISABLE'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] py-0.5">
                        <span className="text-gray-450 font-bold">EMA (20) Envelope</span>
                        <button
                          onClick={() => toggleIndicator('ema')}
                          className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                            activeIndicators.ema
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-455'
                              : 'bg-transparent border-gray-800 text-gray-500'
                          }`}
                        >
                          {activeIndicators.ema ? 'ACTIVE' : 'DISABLE'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] py-0.5">
                        <span className="text-gray-450 font-bold">Bollinger Bands</span>
                        <button
                          onClick={() => toggleIndicator('bb')}
                          className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                            activeIndicators.bb
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                              : 'bg-transparent border-gray-800 text-gray-500'
                          }`}
                        >
                          {activeIndicators.bb ? 'ACTIVE' : 'DISABLE'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] py-0.5">
                        <span className="text-gray-450 font-bold">Relative Strength (RSI)</span>
                        <button
                          onClick={() => toggleIndicator('rsi')}
                          className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                            activeIndicators.rsi
                              ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                              : 'bg-transparent border-gray-800 text-gray-500'
                          }`}
                        >
                          {activeIndicators.rsi ? 'ACTIVE' : 'DISABLE'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#0B1220]/50 border border-gray-800 rounded-xl text-center text-gray-500 flex flex-col items-center space-y-2 select-none">
                <Activity className="w-8 h-8 text-gray-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Select a Stock</span>
                <span className="text-[10px] text-gray-600">Click a row in the Stock Screener table to mount interactive candlestick charts and technical diagnostics.</span>
              </div>
            )}
          </div>

          {/* 3. Right Sidebar Panel (Market Movers, Watchlist, Recently Viewed) */}
          <aside className="w-80 border-l border-[#1f2937]/50 bg-[#050816]/95 shrink-0 flex flex-col overflow-y-auto p-4 space-y-5 select-none scrollbar-thin">
            
            {/* Widget 1: Market Movers Tab Control */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/30 pb-2">
                <Flame className="w-4 h-4 text-emerald-450 mr-1.5" />
                <span>Market Movers</span>
              </h4>
              
              {/* Tab Selector pills */}
              <div className="flex bg-[#0B1220] p-1 rounded-xl border border-[#1f2937]/40 text-[9.5px]">
                <button
                  onClick={() => setRightSidebarTab('gainers')}
                  className={`flex-1 text-center py-1 rounded-lg font-black transition-all cursor-pointer ${
                    rightSidebarTab === 'gainers'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Gainers
                </button>
                <button
                  onClick={() => setRightSidebarTab('losers')}
                  className={`flex-1 text-center py-1 rounded-lg font-black transition-all cursor-pointer ${
                    rightSidebarTab === 'losers'
                      ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Losers
                </button>
                <button
                  onClick={() => setRightSidebarTab('active')}
                  className={`flex-1 text-center py-1 rounded-lg font-black transition-all cursor-pointer ${
                    rightSidebarTab === 'active'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Active
                </button>
              </div>

              {/* Ticker rows display */}
              <div className="space-y-1.5 mt-2">
                {widgetLists &&
                  widgetLists[rightSidebarTab].map((mStock) => {
                    const isPos = mStock.changePercent >= 0;
                    const isTick = recentUpdates[mStock.symbol];
                    const activeBg = selectedSymbol === mStock.symbol ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#0B1220]/40 border-gray-850 hover:bg-[#0B1220]/60';
                    
                    return (
                      <div
                        key={mStock.symbol}
                        onClick={() => {
                          setSelectedSymbol(mStock.symbol);
                          addRecentlyViewed(mStock.symbol);
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all duration-300 ${activeBg}`}
                      >
                        <div className="min-w-0">
                          <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{mStock.symbol}</span>
                          <span className="text-[9px] text-gray-500 truncate block max-w-[140px] font-semibold">
                            {rightSidebarTab === 'active' ? `Vol: ${formatCompact(mStock.volume)}` : mStock.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(mStock.price)}</span>
                          <span className={`text-[9.5px] font-black tabular-nums ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                            {isPos ? '+' : ''}
                            {mStock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Widget 2: My Watchlist Widget */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#1f2937]/30 pb-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Star className="w-4 h-4 text-amber-400 mr-1.5 fill-current" />
                  <span>My Watchlist ({watchlist.length})</span>
                </h4>
                
                <button
                  onClick={() => {
                    const view = activeView === 'watchlist' ? 'screener' : 'watchlist';
                    useUiStore.getState().setActiveView(view);
                  }}
                  className="text-[9px] text-blue-405 font-black hover:underline cursor-pointer uppercase"
                >
                  {activeView === 'watchlist' ? 'Show All' : 'View Full'}
                </button>
              </div>

              <div className="space-y-1.5">
                {watchlist.length === 0 ? (
                  <div className="p-4 bg-[#0B1220]/30 border border-[#1f2937]/30 rounded-lg text-center text-gray-600 font-bold text-[9px]">
                    No starred stocks in watchlist.
                  </div>
                ) : (
                  watchlist.slice(0, 5).map((symbol) => {
                    const wStock = rawStocks.find((s) => s.symbol === symbol);
                    if (!wStock) return null;
                    const isPos = wStock.changePercent >= 0;
                    const activeBg = selectedSymbol === symbol ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#0B1220]/40 border-gray-850 hover:bg-[#0B1220]/60';

                    return (
                      <div
                        key={symbol}
                        onClick={() => {
                          setSelectedSymbol(symbol);
                          addRecentlyViewed(symbol);
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all duration-300 ${activeBg}`}
                      >
                        <div className="min-w-0">
                          <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{symbol}</span>
                          <span className="text-[9px] text-gray-500 truncate block max-w-[140px] font-semibold">
                            {wStock.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(wStock.price)}</span>
                          <span className={`text-[9.5px] font-black tabular-nums ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                            {isPos ? '+' : ''}
                            {wStock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Widget 3: Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/30 pb-2">
                  <History className="w-4 h-4 text-blue-400 mr-1.5" />
                  <span>Recently Viewed</span>
                </h4>
                
                <div className="space-y-1.5">
                  {recentlyViewed.map((symbol) => {
                    const rStock = rawStocks.find((s) => s.symbol === symbol);
                    if (!rStock) return null;
                    const isPos = rStock.changePercent >= 0;
                    const activeBg = selectedSymbol === symbol ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#0B1220]/40 border-gray-850 hover:bg-[#0B1220]/60';

                    return (
                      <div
                        key={symbol}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all duration-300 ${activeBg}`}
                      >
                        <div className="min-w-0">
                          <span className="font-extrabold text-[10px] text-gray-200 block tracking-wide">{symbol}</span>
                          <span className="text-[9px] text-gray-500 truncate block max-w-[140px] font-semibold">
                            {rStock.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-300 block tabular-nums">{formatCurrency(rStock.price)}</span>
                          <span className={`text-[9.5px] font-black tabular-nums ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                            {isPos ? '+' : ''}
                            {rStock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Slide-out Filters Drawer */}
      <Drawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Institutional Filter & Condition Panel"
        size="md"
      >
        <FilterDrawer />
      </Drawer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
