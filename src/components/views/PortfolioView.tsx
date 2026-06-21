'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import { Briefcase, ArrowUpRight, ArrowDownRight, DollarSign, PieChart, ShieldAlert } from 'lucide-react';

export default function PortfolioView() {
  const { holdings, cashBalance, stocksMap, buyStock, sellStock } = useStockStore();
  const { setDetailSymbol, showToast } = useUiStore();

  // Form states for trading
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeShares, setTradeShares] = useState(10);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  // Find stock profile for the trade input
  const targetStock = useMemo(() => {
    if (!tradeSymbol) return null;
    return stocksMap[tradeSymbol.toUpperCase().trim()] || null;
  }, [tradeSymbol, stocksMap]);

  // Compute live holding metrics
  const holdingDetails = useMemo(() => {
    let totalHoldingsVal = 0;
    let totalInvested = 0;

    const list = holdings.map(h => {
      const liveStock = stocksMap[h.symbol];
      const currentPrice = liveStock ? liveStock.price : h.buyPrice;
      const value = h.shares * currentPrice;
      const cost = h.shares * h.buyPrice;
      const pnl = value - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      
      totalHoldingsVal += value;
      totalInvested += cost;

      return {
        symbol: h.symbol,
        name: liveStock ? liveStock.name : 'Unknown Company',
        sector: liveStock ? liveStock.sector : 'Other',
        shares: h.shares,
        buyPrice: h.buyPrice,
        currentPrice,
        value: Number(value.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        pnlPercent: Number(pnlPercent.toFixed(2))
      };
    });

    const totalPortfolioVal = totalHoldingsVal + cashBalance;
    const totalPnl = totalHoldingsVal - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
      holdingsList: list,
      totalHoldingsVal: Number(totalHoldingsVal.toFixed(2)),
      totalPortfolioVal: Number(totalPortfolioVal.toFixed(2)),
      totalPnl: Number(totalPnl.toFixed(2)),
      totalPnlPercent: Number(totalPnlPercent.toFixed(2)),
      totalInvested
    };
  }, [holdings, cashBalance, stocksMap]);

  // Compute sector allocation details for SVG chart
  const sectorAllocation = useMemo(() => {
    const sectors: Record<string, number> = {};
    let totalVal = 0;

    holdingDetails.holdingsList.forEach(h => {
      sectors[h.sector] = (sectors[h.sector] || 0) + h.value;
      totalVal += h.value;
    });

    return Object.keys(sectors).map((name, i) => {
      const val = sectors[name];
      const pct = totalVal > 0 ? (val / totalVal) * 100 : 0;
      
      // Preset color wheels
      const colors = [
        '#3B82F6', // blue
        '#10B981', // emerald
        '#F59E0B', // amber
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#06B6D4', // cyan
        '#EF4444', // red
      ];

      return {
        name,
        value: val,
        percentage: Number(pct.toFixed(1)),
        color: colors[i % colors.length]
      };
    }).sort((a, b) => b.value - a.value);
  }, [holdingDetails]);

  // Execute trade
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStock) {
      showToast('Please select a valid ticker symbol from the active terminal database.', 'error');
      return;
    }
    if (tradeShares <= 0) {
      showToast('Shares count must be greater than zero.', 'error');
      return;
    }

    const price = targetStock.price;
    if (tradeType === 'BUY') {
      const res = buyStock(targetStock.symbol, tradeShares, price);
      if (res.success) {
        showToast(res.message, 'success');
        setTradeShares(10);
      } else {
        showToast(res.message, 'error');
      }
    } else {
      const res = sellStock(targetStock.symbol, tradeShares, price);
      if (res.success) {
        showToast(res.message, 'success');
        setTradeShares(10);
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleSelectHolding = (symbol: string) => {
    setDetailSymbol(symbol);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Portfolio Asset Manager</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Live accounting, stock transactions & sector allocation rings</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <DollarSign className="w-3.5 h-3.5 mr-1" />
          <span>FUNDS SETTLED INSTANTLY</span>
        </div>
      </div>

      {/* Performance Metrics Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="glass-card p-3 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-blue-500">
          <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Net Account Value</span>
          <span className="text-sm font-black text-white block mt-1 tabular-nums">{formatCurrency(holdingDetails.totalPortfolioVal)}</span>
        </div>
        <div className="glass-card p-3 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-emerald-500">
          <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Available Cash Balance</span>
          <span className="text-sm font-black text-white block mt-1 tabular-nums">{formatCurrency(cashBalance)}</span>
        </div>
        <div className="glass-card p-3 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-purple-500">
          <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Holdings Valuation</span>
          <span className="text-sm font-black text-white block mt-1 tabular-nums">{formatCurrency(holdingDetails.totalHoldingsVal)}</span>
        </div>
        <div className="glass-card p-3 rounded-xl border border-[#1f2937]/50 border-l-2 border-l-amber-500">
          <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block">Unrealized P&L</span>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className={`text-sm font-black tabular-nums ${holdingDetails.totalPnl >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
              {holdingDetails.totalPnl >= 0 ? '+' : ''}{formatCurrency(holdingDetails.totalPnl)}
            </span>
            <span className={`text-[9.5px] font-bold tabular-nums ${holdingDetails.totalPnl >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
              ({holdingDetails.totalPnl >= 0 ? '+' : ''}{holdingDetails.totalPnlPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: Holdings Table (Take up 2/3 width) */}
        <div className="lg:col-span-2 flex flex-col bg-[#0B1220]/20 border border-[#1f2937]/50 rounded-2xl overflow-hidden min-h-0">
          <div className="p-3 border-b border-[#1f2937]/50 bg-[#050816]/40 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Positions ({holdingDetails.holdingsList.length})</h3>
            <span className="text-[8.5px] text-gray-500 font-bold uppercase">Real-time quotes</span>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead className="sticky top-0 bg-[#050816] text-gray-400 font-black border-b border-[#1f2937]/50 z-10 select-none uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Shares</th>
                  <th className="p-3 text-right">Avg Cost</th>
                  <th className="p-3 text-right">Last Price</th>
                  <th className="p-3 text-right">Total Value</th>
                  <th className="p-3 text-right">Total P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/35">
                {holdingDetails.holdingsList.map(h => {
                  const isPos = h.pnl >= 0;
                  return (
                    <tr
                      key={h.symbol}
                      onClick={() => handleSelectHolding(h.symbol)}
                      className="hover:bg-[#0B1220]/65 transition-colors cursor-pointer border-b border-[#1f2937]/20"
                    >
                      <td className="p-3">
                        <span className="font-extrabold text-white block">{h.symbol}</span>
                        <span className="text-[8.5px] text-gray-500 font-bold">{h.name}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-300 tabular-nums">{h.shares}</td>
                      <td className="p-3 text-right font-mono text-gray-400 tabular-nums">{formatCurrency(h.buyPrice)}</td>
                      <td className="p-3 text-right font-mono text-gray-300 tabular-nums">{formatCurrency(h.currentPrice)}</td>
                      <td className="p-3 text-right font-mono font-bold text-gray-200 tabular-nums">{formatCurrency(h.value)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        <span className={`font-black block ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                          {isPos ? '+' : ''}{formatCurrency(h.pnl)}
                        </span>
                        <span className={`text-[8.5px] font-bold block ${isPos ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                          {isPos ? '+' : ''}{h.pnlPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {holdingDetails.holdingsList.length === 0 && (
              <div className="p-12 text-center text-gray-600 font-bold text-xs uppercase tracking-wider select-none flex flex-col items-center justify-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-gray-700 animate-bounce" />
                <span>No active stock holdings found in this portfolio</span>
                <span className="text-[9.5px] text-gray-700 normal-case">Use the Trade Terminal widget on the right to acquire positions.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Allocation Chart & Order Ticket (Take up 1/3 width) */}
        <div className="space-y-4 overflow-y-auto flex flex-col justify-between scrollbar-none min-h-0">
          
          {/* Donut Allocation widget */}
          <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3 shrink-0">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
              <PieChart className="w-4 h-4 text-purple-400 mr-1.5" />
              <span>Asset Allocation</span>
            </h3>

            {sectorAllocation.length > 0 ? (
              <div className="flex flex-col items-center space-y-4">
                {/* SVG Visual Arc bar representation */}
                <div className="flex flex-col w-full space-y-2">
                  {sectorAllocation.map(sec => (
                    <div key={sec.name} className="space-y-1 text-[9.5px]">
                      <div className="flex justify-between font-bold text-gray-300">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                          <span>{sec.name}</span>
                        </div>
                        <span>{sec.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#050816] rounded-full overflow-hidden border border-gray-850">
                        <div className="h-full rounded-full" style={{ width: `${sec.percentage}%`, backgroundColor: sec.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600 text-[9px] font-bold uppercase tracking-wider">
                No sectors to allocate. Buy a position first.
              </div>
            )}
          </div>

          {/* Trade Order Ticket widget */}
          <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
                <Briefcase className="w-4 h-4 text-blue-400 mr-1.5" />
                <span>Trade Terminal Ticket</span>
              </h3>

              <form onSubmit={handleExecuteTrade} className="space-y-3 mt-3">
                {/* Action tabs Buy / Sell */}
                <div className="flex bg-[#050816] p-0.5 rounded-xl border border-gray-850 text-[10px] font-black">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`flex-1 text-center py-1.5 rounded-lg cursor-pointer transition-all ${
                      tradeType === 'BUY'
                        ? 'bg-blue-600 text-white font-black shadow-lg'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    BUY SHARES
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`flex-1 text-center py-1.5 rounded-lg cursor-pointer transition-all ${
                      tradeType === 'SELL'
                        ? 'bg-rose-600 text-white font-black shadow-lg'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    SELL SHARES
                  </button>
                </div>

                {/* Ticker Search */}
                <div className="space-y-1">
                  <label className="text-[8.5px] text-gray-550 font-black uppercase tracking-wider block">Ticker Symbol</label>
                  <input
                    type="text"
                    value={tradeSymbol}
                    onChange={(e) => setTradeSymbol(e.target.value)}
                    placeholder="Enter ticker (e.g. TECH_APEX100)"
                    className="w-full bg-[#050816] border border-gray-850 rounded-xl px-3 py-1.5 text-[10px] text-gray-250 placeholder-gray-650 focus:outline-none focus:border-blue-500/40 uppercase font-mono font-bold"
                  />
                  {targetStock && (
                    <div className="flex justify-between items-center bg-[#050816]/50 p-2 rounded-lg border border-gray-850 mt-1.5 text-[9px]">
                      <span className="text-gray-400 font-bold truncate max-w-[130px]">{targetStock.name}</span>
                      <span className="font-black text-gray-200 tabular-nums">Price: {formatCurrency(targetStock.price)}</span>
                    </div>
                  )}
                </div>

                {/* Shares Count */}
                <div className="space-y-1">
                  <label className="text-[8.5px] text-gray-550 font-black uppercase tracking-wider block">Shares Quantity</label>
                  <input
                    type="number"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#050816] border border-gray-850 rounded-xl px-3 py-1.5 text-[10px] text-gray-250 font-mono font-bold focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                {/* Trade Mathematics summary */}
                {targetStock && (
                  <div className="bg-[#050816]/70 p-2.5 rounded-xl border border-gray-850 text-[9.5px] space-y-1 font-bold">
                    <div className="flex justify-between text-gray-550">
                      <span>Subtotal Cost:</span>
                      <span className="text-gray-300 font-mono tabular-nums">{formatCurrency(tradeShares * targetStock.price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-550 border-t border-gray-850/50 pt-1">
                      <span>Cash Remaining:</span>
                      <span className="text-gray-300 font-mono tabular-nums">
                        {formatCurrency(tradeType === 'BUY' ? cashBalance - (tradeShares * targetStock.price) : cashBalance + (tradeShares * targetStock.price))}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2 rounded-xl text-white font-black text-[9.5px] uppercase tracking-widest transition-all cursor-pointer shadow-lg ${
                    tradeType === 'BUY'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  EXECUTE {tradeType} POSITION
                </button>
              </form>
            </div>
            
            <div className="text-[8.5px] text-gray-550 text-center font-semibold pt-3 leading-normal">
              Transactional accounting operates on simulated instant settlement rules under paper trading account credentials.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
