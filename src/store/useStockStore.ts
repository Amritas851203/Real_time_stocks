import { create } from 'zustand';
import { Stock, WebSocketUpdate, BenchmarkStats, Holding, PriceAlert } from '../types';
import { generateStocks } from '../utils/mockDataGenerator';
import { webSocketService } from '../services/websocket';
import { useUiStore } from './useUiStore';

interface StockState {
  stocks: Stock[];
  stocksMap: Record<string, Stock>;
  watchlist: string[];
  recentUpdates: Record<string, { direction: 'up' | 'down'; timestamp: number }>;
  
  // Portfolio & Alert States
  cashBalance: number;
  holdings: Holding[];
  alerts: PriceAlert[];

  // Benchmark state
  benchmark: BenchmarkStats;
  
  recentlyViewed: string[];
  
  // Actions
  initializeStocks: () => void;
  updateStocksRealTime: (updates: WebSocketUpdate[]) => void;
  toggleWatchlist: (symbol: string) => void;
  setBenchmark: (stats: Partial<BenchmarkStats>) => void;
  clearRecentUpdates: () => void;
  addRecentlyViewed: (symbol: string) => void;
  
  // Portfolio Actions
  buyStock: (symbol: string, shares: number, price: number) => { success: boolean; message: string };
  sellStock: (symbol: string, shares: number, price: number) => { success: boolean; message: string };
  
  // Alert Actions
  addAlert: (symbol: string, type: 'above' | 'below', value: number) => void;
  removeAlert: (id: string) => void;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  stocksMap: {},
  watchlist: [],
  recentUpdates: {},
  recentlyViewed: [],
  
  // Portfolio & Alert States
  cashBalance: 100000, // Start with $100k
  holdings: [],
  alerts: [
    { id: 'a1', symbol: 'TECH_APEX100', type: 'above', thresholdValue: 200, status: 'active' },
    { id: 'a2', symbol: 'FIN_NOVA101', type: 'below', thresholdValue: 70, status: 'active' },
    { id: 'a3', symbol: 'HLTH_CORE102', type: 'above', thresholdValue: 150, status: 'active' }
  ],
  
  benchmark: {
    filterExecutionTimeMs: 0,
    renderTimeMs: 0,
    renderedRowCount: 0,
    fps: 60,
    estimatedMemoryMb: null,
  },

  initializeStocks: () => {
    // Generate exactly 5050 stocks for high-performance virtualization demonstration
    const dataset = generateStocks(5050);
    const map: Record<string, Stock> = {};
    const symbols: string[] = [];

    for (let i = 0; i < dataset.length; i++) {
      const stock = dataset[i];
      map[stock.symbol] = stock;
      symbols.push(stock.symbol);
    }

    // Set symbols in the websocket service so it knows what to update
    webSocketService.setSymbols(symbols);

    set({
      stocks: dataset,
      stocksMap: map,
    });
  },

  updateStocksRealTime: (updates) => {
    set((state) => {
      const newStocks = [...state.stocks];
      const newStocksMap = { ...state.stocksMap };
      const newRecentUpdates = { ...state.recentUpdates };
      const now = Date.now();
      const updatedAlerts = [...state.alerts];

      for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        const stock = newStocksMap[update.symbol];
        if (!stock) continue;

        // Calculate direction
        const prevPrice = stock.price;
        const priceChangePct = update.changePercent;
        const newPrice = Number((prevPrice * (1 + priceChangePct / 100)).toFixed(2));
        
        const direction = newPrice >= prevPrice ? 'up' : 'down';
        
        // Update values
        stock.price = newPrice;
        stock.changePercent = Number((stock.changePercent + priceChangePct).toFixed(2));
        stock.volume += update.volume;

        // 52-week updates
        if (newPrice < stock.low52) stock.low52 = newPrice;
        if (newPrice > stock.high52) stock.high52 = newPrice;

        // Update arrays & maps
        newStocksMap[update.symbol] = { ...stock };
        newRecentUpdates[update.symbol] = { direction, timestamp: now };

        // Check alerts for this stock
        for (let j = 0; j < updatedAlerts.length; j++) {
          const alert = updatedAlerts[j];
          if (alert.symbol === update.symbol && alert.status === 'active') {
            const isTriggered = 
              (alert.type === 'above' && newPrice >= alert.thresholdValue) ||
              (alert.type === 'below' && newPrice <= alert.thresholdValue);
            
            if (isTriggered) {
              updatedAlerts[j] = {
                ...alert,
                status: 'triggered',
                triggeredAt: now
              };
              // Display toast notification
              useUiStore.getState().showToast(
                `🚨 Price Alert: ${alert.symbol} went ${alert.type} ${alert.thresholdValue} (Current: $${newPrice})`,
                alert.type === 'above' ? 'success' : 'error'
              );
            }
          }
        }

        // Also update items in array
        const idx = newStocks.findIndex((s) => s.symbol === update.symbol);
        if (idx !== -1) {
          newStocks[idx] = newStocksMap[update.symbol];
        }
      }

      // Purge updates older than 1.5s to keep the recent updates map small
      for (const symbol in newRecentUpdates) {
        if (now - newRecentUpdates[symbol].timestamp > 1500) {
          delete newRecentUpdates[symbol];
        }
      }

      return {
        stocks: newStocks,
        stocksMap: newStocksMap,
        recentUpdates: newRecentUpdates,
        alerts: updatedAlerts
      };
    });
  },

  toggleWatchlist: (symbol) => {
    set((state) => {
      const inWatchlist = state.watchlist.includes(symbol);
      const newWatchlist = inWatchlist
        ? state.watchlist.filter((s) => s !== symbol)
        : [...state.watchlist, symbol];
      return { watchlist: newWatchlist };
    });
  },

  setBenchmark: (stats) => {
    set((state) => ({
      benchmark: {
        ...state.benchmark,
        ...stats,
      },
    }));
  },

  clearRecentUpdates: () => set({ recentUpdates: {} }),
  
  addRecentlyViewed: (symbol) => {
    set((state) => {
      const filtered = state.recentlyViewed.filter((s) => s !== symbol);
      return { recentlyViewed: [symbol, ...filtered].slice(0, 5) };
    });
  },

  buyStock: (symbol, shares, price) => {
    const state = get();
    const cost = shares * price;
    if (state.cashBalance < cost) {
      return { success: false, message: `Insufficient cash. Required: $${cost.toFixed(2)}, Available: $${state.cashBalance.toFixed(2)}` };
    }

    const currentHoldings = [...state.holdings];
    const existingHoldingIndex = currentHoldings.findIndex(h => h.symbol === symbol);

    if (existingHoldingIndex !== -1) {
      const existing = currentHoldings[existingHoldingIndex];
      const newShares = existing.shares + shares;
      const newBuyPrice = ((existing.buyPrice * existing.shares) + (price * shares)) / newShares;
      currentHoldings[existingHoldingIndex] = {
        symbol,
        shares: newShares,
        buyPrice: Number(newBuyPrice.toFixed(2))
      };
    } else {
      currentHoldings.push({
        symbol,
        shares,
        buyPrice: price
      });
    }

    set({
      cashBalance: Number((state.cashBalance - cost).toFixed(2)),
      holdings: currentHoldings
    });

    return { success: true, message: `Successfully bought ${shares} shares of ${symbol} for $${price.toFixed(2)}` };
  },

  sellStock: (symbol, shares, price) => {
    const state = get();
    const currentHoldings = [...state.holdings];
    const existingHoldingIndex = currentHoldings.findIndex(h => h.symbol === symbol);

    if (existingHoldingIndex === -1 || currentHoldings[existingHoldingIndex].shares < shares) {
      const owned = existingHoldingIndex === -1 ? 0 : currentHoldings[existingHoldingIndex].shares;
      return { success: false, message: `Insufficient shares. You only own ${owned} shares of ${symbol}` };
    }

    const existing = currentHoldings[existingHoldingIndex];
    const remainingShares = existing.shares - shares;
    const credit = shares * price;

    if (remainingShares === 0) {
      currentHoldings.splice(existingHoldingIndex, 1);
    } else {
      currentHoldings[existingHoldingIndex] = {
        ...existing,
        shares: remainingShares
      };
    }

    set({
      cashBalance: Number((state.cashBalance + credit).toFixed(2)),
      holdings: currentHoldings
    });

    return { success: true, message: `Successfully sold ${shares} shares of ${symbol} for $${price.toFixed(2)}` };
  },

  addAlert: (symbol, type, value) => {
    const state = get();
    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substring(2, 9),
      symbol,
      type,
      thresholdValue: value,
      status: 'active'
    };
    set({
      alerts: [newAlert, ...state.alerts]
    });
  },

  removeAlert: (id) => {
    const state = get();
    set({
      alerts: state.alerts.filter(a => a.id !== id)
    });
  }
}));

