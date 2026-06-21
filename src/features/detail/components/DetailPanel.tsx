import React, { useState } from 'react';
import { useUiStore } from '../../../store/useUiStore';
import { useStockStore } from '../../../store/useStockStore';
import Drawer from '../../../components/ui/Drawer';
import ChartContainer from '../../chart/components/ChartContainer';
import { generateFinancials } from '../../../utils/mockDataGenerator';
import { Star, BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, FileText, Download, ShieldCheck } from 'lucide-react';

export default function DetailPanel() {
  const { detailSymbol, setDetailSymbol } = useUiStore();
  const { stocksMap, watchlist, toggleWatchlist } = useStockStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'financials' | 'reports'>('overview');

  const stock = detailSymbol ? stocksMap[detailSymbol] : null;

  if (!stock) return null;

  const isStarred = watchlist.includes(stock.symbol);
  const isPositive = stock.changePercent >= 0;

  // Retrieve deterministic financials
  const financialYears = generateFinancials(stock.symbol);

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
    { label: 'ROE', value: `${stock.roe}%`, icon: Activity },
    { label: 'Debt/Equity', value: `${stock.debtEquity}`, icon: BarChart3 },
    { label: 'Dividend Yield', value: `${stock.dividendYield}%`, icon: DollarSign },
    { label: '52W High', value: formatCurrency(stock.high52), icon: TrendingUp, color: 'text-emerald-400' },
    { label: '52W Low', value: formatCurrency(stock.low52), icon: TrendingDown, color: 'text-rose-400' },
  ];

  const handleDownloadReport = (reportName: string) => {
    useUiStore.getState().showToast(`Initiating download for ${stock.symbol} ${reportName}...`, 'success');
  };

  return (
    <Drawer
      isOpen={detailSymbol !== null}
      onClose={() => {
        console.log("[DEBUG] DetailPanel onClose callback called");
        setDetailSymbol(null);
        setActiveTab('overview'); // reset tab on close
      }}
      title={`${stock.symbol} - Detailed Profile Terminal`}
      size="xl"
    >
      <div className="space-y-5 select-none text-xs flex flex-col h-full">
        
        {/* Company Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] rounded-xl p-4 shrink-0">
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
              className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
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

        {/* Tab Selector */}
        <div className="flex bg-[#161b22] p-0.5 rounded-xl border border-[#30363d] text-[10px] font-black shrink-0">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'chart', label: 'INTERACTIVE CHART' },
            { id: 'financials', label: 'FINANCIAL STATEMENTS' },
            { id: 'reports', label: 'ANALYST REPORTS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0d1117] border border-[#30363d] text-blue-400 font-black'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <span className="text-[10px] text-gray-550 block font-bold">{stat.label}</span>
                        <span className={`text-xs font-bold text-gray-200 ${stat.color || ''}`}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Narrative Description Overview */}
              <div className="space-y-2 bg-[#161b22]/30 border border-[#30363d]/30 rounded-xl p-4 leading-relaxed">
                <h2 className="text-xs font-black text-gray-300 uppercase tracking-wider">Company Profile Summary</h2>
                <p className="text-gray-400 text-[11px] font-semibold leading-relaxed">
                  {stock.name} is a leading enterprise operating in the <span className="text-gray-300 font-semibold">{stock.sector}</span> sector. 
                  With a current market valuation of <span className="text-gray-300 font-semibold">{formatCurrency(stock.marketCap)}</span> ({capTier}), 
                  the stock commands a significant presence in its market tier. The price is currently trading at <span className="text-gray-300 font-semibold">{formatCurrency(stock.price)}</span>, 
                  which is positioned between its 52-week low of <span className="text-gray-400 font-semibold">{formatCurrency(stock.low52)}</span> and high of <span className="text-gray-400 font-semibold">{formatCurrency(stock.high52)}</span>. 
                  {stock.peRatio !== null ? (
                    <span> The company exhibits a P/E multiple of <span className="text-gray-300 font-semibold">{stock.peRatio.toFixed(2)}</span> with an annual Earnings Per Share (EPS) of <span className="text-gray-300 font-semibold">${stock.eps.toFixed(2)}</span>.</span>
                  ) : (
                    <span> Under current earnings statements, the firm is unprofitable, posting negative Earnings Per Share (EPS) of <span className="text-rose-400 font-semibold">${stock.eps.toFixed(2)}</span>.</span>
                  )}
                  {' '}The business generates return values yielding ROE performance markers of <span className="text-white font-bold">{stock.roe}%</span> alongside an aggregate leverage debt/equity coefficient of <span className="text-white font-bold">{stock.debtEquity}</span>. 
                  Real-time updates continue to track daily transactions and volume movements (averaging {formatCompact(stock.volume)} shares/day) under connection websocket listeners.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="h-[400px] relative">
              <ChartContainer stock={stock} />
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Income Statement */}
              <div className="bg-[#161b22]/30 border border-[#30363d]/50 rounded-2xl overflow-hidden">
                <div className="p-3 bg-[#161b22]/70 border-b border-[#30363d] font-black text-gray-300 uppercase tracking-widest text-[9.5px]">
                  Income Statement
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#30363d] text-gray-500 font-black">
                      <th className="p-3">Financial Metric</th>
                      {financialYears.map(fy => (
                        <th key={fy.year} className="p-3 text-right">{fy.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/30 font-bold text-gray-300">
                    <tr>
                      <td className="p-3">Total Revenue</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{formatCurrency(fy.revenue)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Net Income</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className={`p-3 text-right font-mono tabular-nums ${fy.netIncome >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                          {formatCurrency(fy.netIncome)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Net Profit Margin %</td>
                      {financialYears.map(fy => {
                        const margin = (fy.netIncome / fy.revenue) * 100;
                        return (
                          <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{margin.toFixed(1)}%</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Balance Sheet */}
              <div className="bg-[#161b22]/30 border border-[#30363d]/50 rounded-2xl overflow-hidden">
                <div className="p-3 bg-[#161b22]/70 border-b border-[#30363d] font-black text-gray-300 uppercase tracking-widest text-[9.5px]">
                  Balance Sheet
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#30363d] text-gray-500 font-black">
                      <th className="p-3">Balance Metric</th>
                      {financialYears.map(fy => (
                        <th key={fy.year} className="p-3 text-right">{fy.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/30 font-bold text-gray-300">
                    <tr>
                      <td className="p-3">Total Assets</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{formatCurrency(fy.assets)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Total Liabilities</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{formatCurrency(fy.liabilities)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Shareholders Equity</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{formatCurrency(fy.equity)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cash Flow */}
              <div className="bg-[#161b22]/30 border border-[#30363d]/50 rounded-2xl overflow-hidden">
                <div className="p-3 bg-[#161b22]/70 border-b border-[#30363d] font-black text-gray-300 uppercase tracking-widest text-[9.5px]">
                  Cash Flow Statement
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#30363d] text-gray-500 font-black">
                      <th className="p-3">Cash Metric</th>
                      {financialYears.map(fy => (
                        <th key={fy.year} className="p-3 text-right">{fy.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/30 font-bold text-gray-300">
                    <tr>
                      <td className="p-3">Operating Cash Flow</td>
                      {financialYears.map(fy => (
                        <td key={fy.year} className="p-3 text-right font-mono tabular-nums">{formatCurrency(fy.cashFlow)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Capital Expenditures (Est.)</td>
                      {financialYears.map(fy => {
                        const capex = Math.round(fy.cashFlow * 0.3); // mock 30%
                        return (
                          <td key={fy.year} className="p-3 text-right font-mono text-rose-405 tabular-nums">-{formatCurrency(capex)}</td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3">Free Cash Flow</td>
                      {financialYears.map(fy => {
                        const capex = Math.round(fy.cashFlow * 0.3);
                        const fcf = fy.cashFlow - capex;
                        return (
                          <td key={fy.year} className="p-3 text-right font-mono text-emerald-450 tabular-nums">{formatCurrency(fcf)}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              {[
                { name: 'Annual 10-K Consolidated Statement.pdf', desc: 'Audited statutory annual financial statements, disclosures and liability risks.' },
                { name: 'Consensus Institutional Equity Rating Report.pdf', desc: 'Aggregated Wall Street equity notes, target price boundaries and sector rankings.' },
                { name: 'Q1 Earnings Results Conference Summary.pdf', desc: 'Executive leadership transcript, guidance revisions and macro segment reviews.' }
              ].map((rep, i) => (
                <div key={i} className="bg-[#161b22]/40 border border-[#30363d]/50 p-4 rounded-xl flex items-center justify-between hover:border-[#8b949e]/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-extrabold text-gray-200 tracking-wide">{rep.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-semibold">{rep.desc}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadReport(rep.name)}
                    className="p-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white hover:border-[#8b949e]/30 transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[8.5px] font-black">DOWNLOAD</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Drawer>
  );
}
