'use client';

import React, { useState } from 'react';
import { Newspaper, Calendar, ShieldCheck, Bookmark, ExternalLink } from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';

interface NewsItem {
  id: string;
  category: string;
  source: string;
  time: string;
  title: string;
  snippet: string;
  impact: 'bullish' | 'bearish' | 'neutral';
}

interface CalendarEvent {
  time: string;
  currency: string;
  event: string;
  forecast: string;
  previous: string;
  impact: 'high' | 'medium' | 'low';
}

export default function NewsView() {
  const { showToast } = useUiStore();
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const newsItems: NewsItem[] = [
    {
      id: 'n1',
      category: 'TECHNOLOGY',
      source: 'Bloomberg Terminal',
      time: '12m ago',
      title: 'Apex Systems announces strategic AI integration partnership with global server farms',
      snippet: 'Apex Systems shares surged 4.2% following the announcement of a multi-year cloud computing partnership that optimizes server utilization using neural networking heuristics.',
      impact: 'bullish'
    },
    {
      id: 'n2',
      category: 'ENERGY',
      source: 'Reuters Prime',
      time: '45m ago',
      title: 'Global oil indices recover slightly amid utilities inventory adjustments',
      snippet: 'WTI Crude rebounded above $75.50 as US Utilities report lower-than-anticipated inventory reserves, stimulating spot contracts pricing across industrial indices.',
      impact: 'neutral'
    },
    {
      id: 'n3',
      category: 'FINANCIALS',
      source: 'Zetheta Research',
      time: '1h ago',
      title: 'Nova Capital records record investment fees as institutional flow accelerates',
      snippet: 'Nova reported a 15% year-on-year increase in asset management fees. Analyst consensus upgrades stock rating to Strong Buy citing ROE efficiency metrics.',
      impact: 'bullish'
    },
    {
      id: 'n4',
      category: 'HEALTHCARE',
      source: 'Wall Street Journal',
      time: '2h ago',
      title: 'Core Therapeutics encounters clinical phase II delays on diagnostic agents',
      snippet: 'The FDA has requested additional trials for Cores key diagnostic agent, extending standard approval timelines. Shares trade lower by 6.8% pre-market.',
      impact: 'bearish'
    },
    {
      id: 'n5',
      category: 'MACROECONOMICS',
      source: 'Federal Reserve Press',
      time: '3h ago',
      title: 'FOMC minutes signal hawkish rate stance until inflation indices stabilize at 2%',
      snippet: 'Committee members reiterate data-dependent approaches to future rate decisions, expressing caution over tight employment figures and sector performance heatmaps.',
      impact: 'neutral'
    },
    {
      id: 'n6',
      category: 'CONSUMER CYCLICAL',
      source: 'Reuters Prime',
      time: '4h ago',
      title: 'Zephyr Devices reports inventory log bottlenecks in shipping corridors',
      snippet: 'Logistics constraints and higher container freight charges have impacted margins in cyclicals. Management lowers Q3 EPS guidance by 4%.',
      impact: 'bearish'
    }
  ];

  const calendarEvents: CalendarEvent[] = [
    { time: '18:00', currency: 'USD', event: 'Core CPI Inflation MoM (Jun)', forecast: '0.2%', previous: '0.1%', impact: 'high' },
    { time: '19:30', currency: 'INR', event: 'Reserve Bank of India Interest Decision', forecast: '6.50%', previous: '6.50%', impact: 'high' },
    { time: '20:00', currency: 'USD', event: 'Fed Interest Rate Decision', forecast: '5.25%', previous: '5.25%', impact: 'high' },
    { time: '21:30', currency: 'GBP', event: 'GDP Growth Rate YoY (Q2)', forecast: '0.6%', previous: '0.4%', impact: 'medium' },
    { time: '22:00', currency: 'EUR', event: 'Manufacturing PMI Flash', forecast: '47.5', previous: '47.3', impact: 'medium' },
    { time: '23:30', currency: 'USD', event: 'Initial Jobless Claims', forecast: '220K', previous: '224K', impact: 'low' }
  ];

  const handleBookmark = (id: string, title: string) => {
    const isBookmarked = bookmarked.includes(id);
    if (isBookmarked) {
      setBookmarked(prev => prev.filter(b => b !== id));
      showToast('Article removed from terminal highlights.', 'info');
    } else {
      setBookmarked(prev => [...prev, id]);
      showToast('Article bookmarked in terminal highlights.', 'success');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Newspaper className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">News & Macro Events</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Real-time financial headlines & global macroeconomic calendars</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>NEWS FEED STABLE</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: News Headlines (Take up 2/3 width) */}
        <div className="lg:col-span-2 flex flex-col bg-[#0B1220]/20 border border-[#1f2937]/50 rounded-2xl overflow-hidden min-h-0">
          <div className="p-3 border-b border-[#1f2937]/50 bg-[#050816]/40 flex justify-between items-center text-[10px] font-black">
            <span className="text-gray-400 uppercase tracking-widest">Global Financial Stream</span>
            <span className="text-gray-550 uppercase">Ticking Live</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#1f2937]/25 scrollbar-thin">
            {newsItems.map(news => {
              const isMarked = bookmarked.includes(news.id);
              return (
                <div key={news.id} className="p-4 space-y-2 hover:bg-[#0B1220]/45 transition-colors">
                  <div className="flex items-center justify-between text-[8.5px] font-black">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 tracking-wider font-extrabold uppercase">{news.category}</span>
                      <span className="text-gray-600 font-extrabold">•</span>
                      <span className="text-gray-500 font-semibold">{news.source}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 font-medium">{news.time}</span>
                      <span className={`px-1 py-0.2 rounded font-black border text-[7.5px] uppercase ${
                        news.impact === 'bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        news.impact === 'bearish' ? 'bg-rose-500/10 text-rose-405 border-rose-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-800'
                      }`}>
                        {news.impact}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-gray-200 hover:text-white transition-colors cursor-pointer leading-snug">
                    {news.title}
                  </h3>
                  
                  <p className="text-[10px] text-gray-450 leading-relaxed font-semibold">
                    {news.snippet}
                  </p>

                  <div className="flex items-center space-x-4 pt-1 text-[9px] font-black">
                    <button
                      onClick={() => handleBookmark(news.id, news.title)}
                      className={`flex items-center space-x-1 cursor-pointer transition-colors ${
                        isMarked ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      <span>{isMarked ? 'SAVED' : 'SAVE TO HIGHLIGHTS'}</span>
                    </button>
                    <button 
                      onClick={() => showToast('Opening original Bloomberg terminal archive...', 'info')}
                      className="flex items-center space-x-1 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>FULL ARCHIVE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Economic Calendar (Take up 1/3 width) */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 flex flex-col min-h-0">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2 shrink-0">
            <Calendar className="w-4 h-4 text-cyan-400 mr-1.5" />
            <span>Economic Calendar</span>
          </h3>

          <div className="space-y-3.5 mt-3 overflow-y-auto flex-1 scrollbar-none text-[9.5px]">
            {calendarEvents.map((evt, i) => (
              <div key={i} className="bg-[#050816]/40 p-2.5 rounded-xl border border-gray-850 space-y-1.5">
                <div className="flex justify-between items-center text-[8.5px] font-black">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-gray-500 font-bold">{evt.time}</span>
                    <span className="text-cyan-455 font-extrabold uppercase">{evt.currency}</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded font-black border text-[7.5px] uppercase ${
                    evt.impact === 'high' ? 'bg-rose-500/10 text-rose-450 border-rose-500/20 animate-pulse' :
                    evt.impact === 'medium' ? 'bg-amber-500/10 text-amber-450 border-amber-500/20' :
                    'bg-[#0B1220] text-gray-500 border-gray-800'
                  }`}>
                    {evt.impact} impact
                  </span>
                </div>

                <span className="font-extrabold text-gray-200 block tracking-wide">{evt.event}</span>

                <div className="grid grid-cols-2 gap-2 text-[8.5px] border-t border-gray-850/50 pt-1.5">
                  <div>
                    <span className="text-gray-500 block font-bold">FORECAST</span>
                    <span className="text-gray-300 font-mono font-black tabular-nums">{evt.forecast}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block font-bold">PREVIOUS</span>
                    <span className="text-gray-300 font-mono font-black tabular-nums">{evt.previous}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
