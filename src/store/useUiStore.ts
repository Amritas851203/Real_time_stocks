import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  selectedSymbol: string | null;
  detailSymbol: string | null;
  chartTimeframe: '1D' | '1W' | '1M' | '1Y';
  activeIndicators: {
    sma: boolean;
    ema: boolean;
    rsi: boolean;
    macd: boolean;
    bb: boolean;
  };
  theme: 'dark' | 'light';
  activeView: 'dashboard' | 'screener' | 'technical' | 'watchlist' | 'charts' | 'market' | 'news' | 'portfolio' | 'alerts' | 'settings';
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setSidebarOpen: (open: boolean) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  setDetailSymbol: (symbol: string | null) => void;
  setChartTimeframe: (tf: '1D' | '1W' | '1M' | '1Y') => void;
  toggleIndicator: (indicator: 'sma' | 'ema' | 'rsi' | 'macd' | 'bb') => void;
  toggleTheme: () => void;
  setActiveView: (view: 'dashboard' | 'screener' | 'technical' | 'watchlist' | 'charts' | 'market' | 'news' | 'portfolio' | 'alerts' | 'settings') => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

let toastTimeout: NodeJS.Timeout;

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  selectedSymbol: null,
  detailSymbol: null,
  chartTimeframe: '1D',
  activeIndicators: {
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bb: false,
  },
  theme: 'dark', // Default theme is premium dark mode
  activeView: 'dashboard',
  toast: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setDetailSymbol: (symbol) => set({ detailSymbol: symbol }),
  setChartTimeframe: (tf) => set({ chartTimeframe: tf }),
  toggleIndicator: (indicator) =>
    set((state) => ({
      activeIndicators: {
        ...state.activeIndicators,
        [indicator]: !state.activeIndicators[indicator],
      },
    })),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),
  setActiveView: (view) => set({ activeView: view }),
  showToast: (message, type = 'info') => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toast: { message, type } });
    toastTimeout = setTimeout(() => {
      set({ toast: null });
    }, 4000);
  },
}));
