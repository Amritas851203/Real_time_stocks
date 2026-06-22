'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { Briefcase, DollarSign, PieChart, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobilePortfolioPage() {
  const { holdings, cashBalance, stocksMap, buyStock, sellStock, stocks } = useStockStore();
  const { showToast } = useUiStore();
  const router = useRouter();

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

  // Compute sector allocation details
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
      showToast('Please select a valid ticker symbol from the terminal.', 'error');
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
        setTradeSymbol('');
      } else {
        showToast(res.message, 'error');
      }
    } else {
      const res = sellStock(targetStock.symbol, tradeShares, price);
      if (res.success) {
        showToast(res.message, 'success');
        setTradeShares(10);
        setTradeSymbol('');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-8">
      {/* Header Panel */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1f2937]/20 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase leading-none">Portfolio</h1>
            <p className="text-[9px] text-gray-500 font-bold mt-1">Live accounting & asset transaction tickets</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-card p-3.5 rounded-2xl border border-[#1f2937]/40 border-l-2 border-l-blue-500">
            <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Net Account Value</span>
            <span className="text-base font-black text-white block mt-1 tabular-nums">
              {formatCurrency(holdingDetails.totalPortfolioVal)}
            </span>
          </div>
          <div className="glass-card p-3.5 rounded-2xl border border-[#1f2937]/40 border-l-2 border-l-emerald-500">
            <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Settled Cash</span>
            <span className="text-base font-black text-emerald-400 block mt-1 tabular-nums">
              {formatCurrency(cashBalance)}
            </span>
          </div>
          <div className="glass-card p-3.5 rounded-2xl border border-[#1f2937]/40 border-l-2 border-l-purple-500">
            <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Positions Value</span>
            <span className="text-base font-black text-white block mt-1 tabular-nums">
              {formatCurrency(holdingDetails.totalHoldingsVal)}
            </span>
          </div>
          <div className="glass-card p-3.5 rounded-2xl border border-[#1f2937]/40 border-l-2 border-l-amber-500">
            <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Unrealized Profit & Loss</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`text-xs font-black tabular-nums ${holdingDetails.totalPnl >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                {holdingDetails.totalPnl >= 0 ? '+' : ''}{formatCurrency(holdingDetails.totalPnl)}
              </span>
              <span className={`text-[9px] font-bold tabular-nums ${holdingDetails.totalPnl >= 0 ? 'text-brand-emerald' : 'text-brand-negative'}`}>
                ({holdingDetails.totalPnl >= 0 ? '+' : ''}{holdingDetails.totalPnlPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Order Ticket Form */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/40 space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/20 pb-2">
            <DollarSign className="w-4 h-4 text-blue-400 mr-1" />
            <span>Order Ticket</span>
          </h3>

          <form onSubmit={handleExecuteTrade} className="space-y-3 text-xs">
            {/* BUY / SELL Action Selector */}
            <div className="flex bg-[#050816] p-0.5 rounded-xl border border-gray-800 text-[10px] font-black">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Stock Autocomplete Input */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Stock Symbol</label>
              <input
                type="text"
                value={tradeSymbol}
                onChange={(e) => setTradeSymbol(e.target.value)}
                placeholder="Enter ticker (e.g. TECH_APEX100)"
                className="w-full bg-[#050816] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/40 uppercase font-mono font-bold"
              />
              {targetStock && (
                <div className="flex justify-between items-center bg-[#050816]/60 p-2.5 rounded-xl border border-gray-800/80 text-[10px] font-semibold mt-1">
                  <span className="text-gray-400 truncate max-w-[150px]">{targetStock.name}</span>
                  <span className="font-black text-gray-200 font-mono">Price: {formatCurrency(targetStock.price)}</span>
                </div>
              )}
            </div>

            {/* Shares Count */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Quantity</label>
              <input
                type="number"
                value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-[#050816] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 font-mono font-bold focus:outline-none focus:border-blue-500/40"
              />
            </div>

            {/* Mathematics details */}
            {targetStock && (
              <div className="bg-[#050816]/70 p-3 rounded-xl border border-gray-850 text-[10px] space-y-1 font-bold">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal Cost:</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatCurrency(tradeShares * targetStock.price)}</span>
                </div>
                <div className="flex justify-between text-gray-500 border-t border-gray-850/40 pt-1.5 mt-1">
                  <span>Cash Remaining:</span>
                  <span className="text-gray-300 font-mono tabular-nums">
                    {formatCurrency(tradeType === 'BUY' ? cashBalance - (tradeShares * targetStock.price) : cashBalance + (tradeShares * targetStock.price))}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg ${
                tradeType === 'BUY'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              EXECUTE {tradeType}
            </button>
          </form>
        </div>

        {/* Active Positions */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active Positions</h2>
          {holdingDetails.holdingsList.length === 0 ? (
            <div className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/20 p-8 text-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
              No holdings found. Submit a BUY ticket above to open positions.
            </div>
          ) : (
            <div className="space-y-2">
              {holdingDetails.holdingsList.map((h) => {
                const isPos = h.pnl >= 0;
                return (
                  <div
                    key={h.symbol}
                    onClick={() => router.push(`/mobile/stock/${h.symbol}`)}
                    className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/50 p-3.5 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-black text-white">{h.symbol}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 border border-gray-700/50 text-gray-400 font-bold">
                          {h.shares} Shares
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[180px]">{h.name}</p>
                      <p className="text-[9px] text-gray-600 mt-0.5 font-bold">
                        Avg Cost {formatCurrency(h.buyPrice)} · Live {formatCurrency(h.currentPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-white tabular-nums">{formatCurrency(h.value)}</p>
                      <div className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPos ? '+' : ''}{h.pnlPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Asset Sector Allocation */}
        {sectorAllocation.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/40 space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/20 pb-2">
              <PieChart className="w-4 h-4 text-purple-400 mr-1" />
              <span>Sector Allocation</span>
            </h3>
            <div className="space-y-2">
              {sectorAllocation.map((sec) => (
                <div key={sec.name} className="space-y-1 text-[10px] font-bold">
                  <div className="flex justify-between text-gray-300">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                      <span>{sec.name}</span>
                    </div>
                    <span>{sec.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#050816] rounded-full overflow-hidden border border-gray-800/80">
                    <div className="h-full rounded-full" style={{ width: `${sec.percentage}%`, backgroundColor: sec.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
