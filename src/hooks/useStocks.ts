import { useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { useUiStore } from '../store/useUiStore';
import { useFilters } from './useFilters';

export function useStocks() {
  const initializeStocks = useStockStore((s) => s.initializeStocks);
  const stocks = useStockStore((s) => s.stocks);
  const watchlist = useStockStore((s) => s.watchlist);
  const activeView = useUiStore((s) => s.activeView);

  console.log('[DEBUG] useStocks: stocks.length =', stocks.length);

  useEffect(() => {
    console.log('[DEBUG] useStocks: useEffect triggered. stocks.length =', stocks.length);
    // Generate initial stocks dataset if empty
    if (stocks.length === 0) {
      console.log('[DEBUG] useStocks: calling initializeStocks()');
      initializeStocks();
    }
  }, [stocks.length, initializeStocks]);

  // Compute filtered dataset
  const filteredStocks = useFilters(stocks);

  // Separate display stocks depending on the current side panel view selected
  const displayStocks = activeView === 'watchlist'
    ? filteredStocks.filter((s) => watchlist.includes(s.symbol))
    : filteredStocks;

  return {
    rawStocks: stocks,
    filteredStocks,
    displayStocks,
    watchlist,
  };
}
