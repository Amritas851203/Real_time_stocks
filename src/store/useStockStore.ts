import { create } from 'zustand';
import { Stock, WebSocketUpdate, BenchmarkStats } from '../types';
import { generateStocks } from '../utils/mockDataGenerator';
import { webSocketService } from '../services/websocket';

interface StockState {
  stocks: Stock[];
  stocksMap: Record<string, Stock>;
  watchlist: string[];
  recentUpdates: Record<string, { direction: 'up' | 'down'; timestamp: number }>;
  
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
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  stocksMap: {},
  watchlist: [],
  recentUpdates: {},
  recentlyViewed: [],
  
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
}));
