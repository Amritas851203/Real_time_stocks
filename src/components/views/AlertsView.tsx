'use client';

import React, { useState, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { useUiStore } from '../../store/useUiStore';
import { Bell, ShieldCheck, Trash2, ToggleLeft, History, Play } from 'lucide-react';

export default function AlertsView() {
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
      showToast('Please enter a valid stock ticker symbol from the terminal system.', 'error');
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
    <div className="space-y-4 animate-fade-in flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/45 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white uppercase leading-none">Price Alert Controller</h1>
            <p className="text-[10px] text-gray-550 font-bold mt-1">Configure active threshold loops synchronized to high-frequency feeds</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-black text-emerald-450 flex items-center bg-[#0B1220] border border-[#1f2937]/50 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>ALERT SYSTEM SYNCED</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Alerts builder card (1/3 width) */}
        <div className="space-y-4 shrink-0 flex flex-col">
          <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/50 space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/35 pb-2">
              <ToggleLeft className="w-4 h-4 text-rose-500 mr-1.5" />
              <span>Configure Price Alert</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-[10px]">
              {/* Ticker Selector */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-gray-550 font-black uppercase tracking-wider block">Target Stock Symbol</label>
                <input
                  type="text"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value)}
                  placeholder="Enter ticker (e.g. TECH_APEX100)"
                  className="w-full bg-[#050816] border border-gray-850 rounded-xl px-3 py-1.5 text-gray-250 placeholder-gray-650 focus:outline-none focus:border-blue-500/40 uppercase font-mono font-bold"
                />
                {resolvedStock && (
                  <div className="flex justify-between items-center bg-[#050816]/50 p-2 rounded-lg border border-gray-850 mt-1.5 text-[9px]">
                    <span className="text-gray-400 font-bold truncate max-w-[130px]">{resolvedStock.name}</span>
                    <span className="font-black text-gray-200 tabular-nums">Last: {formatCurrency(resolvedStock.price)}</span>
                  </div>
                )}
              </div>

              {/* Threshold direction Above / Below */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-gray-550 font-black uppercase tracking-wider block">Condition Mode</label>
                <div className="grid grid-cols-2 gap-2 text-center font-bold">
                  <button
                    type="button"
                    onClick={() => setAlertType('above')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      alertType === 'above'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-450 font-black'
                        : 'bg-[#050816] border-gray-850 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    PRICE GOES ABOVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('below')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      alertType === 'below'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-black'
                        : 'bg-[#050816] border-gray-850 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    PRICE GOES BELOW
                  </button>
                </div>
              </div>

              {/* Threshold Price */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-gray-550 font-black uppercase tracking-wider block">Price Trigger Threshold ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertValue}
                  onChange={(e) => setAlertValue(Math.max(0.01, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#050816] border border-gray-850 rounded-xl px-3 py-1.5 text-gray-250 font-mono font-bold focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-rose-600/20"
              >
                DEPLOY PRICE WATCH
              </button>
            </form>
          </div>
          
          <div className="bg-[#0B1220]/20 p-3.5 rounded-2xl border border-[#1f2937]/50 text-[8.5px] text-gray-550 font-medium leading-relaxed">
            Alert trigger notifications execute client-side using state action callbacks on WebSocket tick completions, delivering active toast indicators instantly.
          </div>
        </div>

        {/* Right columns: Lists table (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col bg-[#0B1220]/20 border border-[#1f2937]/50 rounded-2xl overflow-hidden min-h-0">
          {/* Tab controllers */}
          <div className="p-3 border-b border-[#1f2937]/50 bg-[#050816]/40 flex justify-between items-center text-[10px] font-black">
            <div className="flex bg-[#0B1220] p-0.5 rounded-xl border border-gray-850">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
                  activeTab === 'active'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Active Targets ({activeAlerts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('triggered')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
                  activeTab === 'triggered'
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <History className="w-3 h-3" />
                <span>Triggered Logs ({triggeredAlerts.length})</span>
              </button>
            </div>
            <span className="text-[8.5px] text-gray-550 font-bold uppercase">Consolidated monitor</span>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeTab === 'active' ? (
              <div className="divide-y divide-[#1f2937]/25 text-[10px]">
                {activeAlerts.map(alert => {
                  const sQuote = stocksMap[alert.symbol];
                  const curPrice = sQuote ? sQuote.price : 0;
                  return (
                    <div key={alert.id} className="p-3.5 flex items-center justify-between hover:bg-[#0B1220]/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white">{alert.symbol}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                            alert.type === 'above'
                              ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            If Price Goes {alert.type}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-gray-500 font-bold block truncate max-w-[200px]">
                          {sQuote ? sQuote.name : 'Unknown Equity'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <span className="text-[8.5px] text-gray-550 block font-bold">Watch Price:</span>
                          <span className="text-[10px] font-black text-rose-400 font-mono tabular-nums">{formatCurrency(alert.thresholdValue)}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[8.5px] text-gray-550 block font-bold">Live Price:</span>
                          <span className="text-[10px] font-black text-gray-200 font-mono tabular-nums">{formatCurrency(curPrice)}</span>
                        </div>

                        <button
                          onClick={() => handleCancelAlert(alert.id, alert.symbol)}
                          className="p-2 rounded-lg bg-transparent hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 border border-transparent hover:border-rose-550/20 transition-all cursor-pointer"
                          title="Delete Price Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {activeAlerts.length === 0 && (
                  <div className="p-12 text-center text-gray-600 font-bold uppercase tracking-wider select-none">
                    No active threshold monitors configured. Use the builder on the left to set price watches.
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#1f2937]/25 text-[10px]">
                {triggeredAlerts.map(alert => (
                  <div key={alert.id} className="p-3.5 flex items-center justify-between hover:bg-[#0B1220]/40 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white">{alert.symbol}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                          alert.type === 'above'
                            ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          Triggered {alert.type}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-gray-500 font-bold block">
                        Watch crossed: {formatCurrency(alert.thresholdValue)}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[8px] text-gray-550 font-black block">TRIGGER TIME</span>
                      <span className="text-[10px] font-black text-emerald-450 font-mono block tabular-nums">
                        {formatDate(alert.triggeredAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {triggeredAlerts.length === 0 && (
                  <div className="p-12 text-center text-gray-600 font-bold uppercase tracking-wider select-none">
                    No price alerts have triggered in the current session.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
