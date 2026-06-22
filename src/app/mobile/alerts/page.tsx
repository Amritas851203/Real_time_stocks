'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { Bell, Trash2, ToggleLeft, Play, History, ShieldCheck } from 'lucide-react';

export default function MobileAlertsPage() {
  const { alerts, stocksMap, addAlert, removeAlert } = useStockStore();
  const { showToast } = useUiStore();

  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [alertValue, setAlertValue] = useState(100);
  const [activeTab, setActiveTab] = useState<'active' | 'triggered'>('active');

  const resolvedStock = useMemo(() => {
    if (!alertSymbol) return null;
    return stocksMap[alertSymbol.toUpperCase().trim()] || null;
  }, [alertSymbol, stocksMap]);

  // Split alerts
  const activeAlerts = useMemo(() => alerts.filter(a => a.status === 'active'), [alerts]);
  const triggeredAlerts = useMemo(() => alerts.filter(a => a.status === 'triggered'), [alerts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedStock) {
      showToast('Please enter a valid stock ticker symbol from the terminal.', 'error');
      return;
    }
    if (alertValue <= 0) {
      showToast('Threshold value must be greater than zero.', 'error');
      return;
    }

    addAlert(resolvedStock.symbol, alertType, alertValue);
    showToast(`Price alert registered successfully for ${resolvedStock.symbol} going ${alertType} $${alertValue.toFixed(2)}`, 'success');
    setAlertSymbol('');
  };

  const handleCancelAlert = (id: string, sym: string) => {
    removeAlert(id);
    showToast(`Cancelled price alert check on ${sym}`, 'info');
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-8">
      {/* Header Panel */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1f2937]/20 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-505 to-pink-500 bg-rose-600 flex items-center justify-center text-white">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase leading-none">Price Alerts</h1>
            <p className="text-[9px] text-gray-550 font-bold mt-1">Configure threshold loops on live WebSocket feeds</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Configure Form */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/40 space-y-3.5">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/20 pb-2">
            <ToggleLeft className="w-4 h-4 text-rose-500 mr-1.5" />
            <span>Configure Price Alert</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Ticker Input */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Target Stock Symbol</label>
              <input
                type="text"
                value={alertSymbol}
                onChange={(e) => setAlertSymbol(e.target.value)}
                placeholder="Enter ticker (e.g. TECH_APEX100)"
                className="w-full bg-[#050816] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 placeholder-gray-650 focus:outline-none focus:border-blue-500/40 uppercase font-mono font-bold"
              />
              {resolvedStock && (
                <div className="flex justify-between items-center bg-[#050816]/60 p-2 rounded-xl border border-gray-800 mt-1 text-[10px] font-semibold">
                  <span className="text-gray-400 truncate max-w-[150px]">{resolvedStock.name}</span>
                  <span className="font-black text-gray-200 font-mono">Last: {formatCurrency(resolvedStock.price)}</span>
                </div>
              )}
            </div>

            {/* Above / Below Conditions */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Condition Mode</label>
              <div className="grid grid-cols-2 gap-2 text-center font-bold text-[10px]">
                <button
                  type="button"
                  onClick={() => setAlertType('above')}
                  className={`py-2.5 rounded-lg border cursor-pointer transition-all ${
                    alertType === 'above'
                      ? 'bg-rose-500/10 border-rose-500/35 text-rose-400 font-black'
                      : 'bg-[#050816] border-gray-800 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  PRICE GOES ABOVE
                </button>
                <button
                  type="button"
                  onClick={() => setAlertType('below')}
                  className={`py-2.5 rounded-lg border cursor-pointer transition-all ${
                    alertType === 'below'
                      ? 'bg-blue-500/10 border-blue-500/35 text-blue-400 font-black'
                      : 'bg-[#050816] border-gray-800 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  PRICE GOES BELOW
                </button>
              </div>
            </div>

            {/* Threshold Trigger */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-550 font-black uppercase tracking-wider block">Price Trigger Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                value={alertValue}
                onChange={(e) => setAlertValue(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#050816] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 font-mono font-bold focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-rose-600/20"
            >
              DEPLOY PRICE WATCH
            </button>
          </form>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#0B1220] rounded-xl p-1 gap-1 text-[10px] font-black shrink-0">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'active'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                : 'text-gray-500'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Active Targets ({activeAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('triggered')}
            className={`flex-1 py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'triggered'
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'text-gray-500'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Triggered Logs ({triggeredAlerts.length})</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {activeTab === 'active' ? (
            activeAlerts.length === 0 ? (
              <div className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/20 p-8 text-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
                No active threshold watchers configured. Deplo alert watches above.
              </div>
            ) : (
              activeAlerts.map(alert => {
                const sQuote = stocksMap[alert.symbol];
                const curPrice = sQuote ? sQuote.price : 0;
                return (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/50 p-3.5 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-black text-white">{alert.symbol}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border leading-none ${
                          alert.type === 'above'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px]">
                        {sQuote ? sQuote.name : 'Unknown Equity'}
                      </p>
                      <p className="text-[9px] text-gray-650 mt-0.5 font-bold">
                        Watch {formatCurrency(alert.thresholdValue)} · Live {formatCurrency(curPrice)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelAlert(alert.id, alert.symbol)}
                      className="p-2.5 rounded-xl bg-[#050816]/40 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 border border-gray-800 hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Price Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )
          ) : (
            triggeredAlerts.length === 0 ? (
              <div className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/20 p-8 text-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
                No alerts triggered in this session.
              </div>
            ) : (
              triggeredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-[#1f2937]/30 bg-[#0B1220]/50 p-3.5 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-black text-white">{alert.symbol}</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                        Crossed
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Limit {formatCurrency(alert.thresholdValue)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] text-gray-550 font-black block">TRIGGERED</span>
                    <span className="text-[10px] font-black text-emerald-450 font-mono block">
                      {formatDate(alert.triggeredAt)}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
