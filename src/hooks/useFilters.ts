import { useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useStockStore } from '../store/useStockStore';
import { Stock, CustomRuleGroup, CustomRule } from '../types';

export function evaluateRule(stock: Stock, rule: CustomRule): boolean {
  const val = stock[rule.field];
  if (val === undefined) return false;
  
  const ruleVal = rule.value;

  switch (rule.operator) {
    case 'gt':
      if (val === null) return false;
      return Number(val) > Number(ruleVal);
    case 'lt':
      if (val === null) return false;
      return Number(val) < Number(ruleVal);
    case 'eq':
      if (val === null) return false;
      return String(val).toLowerCase() === String(ruleVal).toLowerCase();
    case 'contains':
      return String(val).toLowerCase().includes(String(ruleVal).toLowerCase());
    case 'in':
      if (Array.isArray(ruleVal)) {
        return ruleVal.some((v) => String(val).toLowerCase() === String(v).toLowerCase());
      }
      return String(val).toLowerCase() === String(ruleVal).toLowerCase();
    default:
      return false;
  }
}

export function evaluateRuleGroup(stock: Stock, group: CustomRuleGroup): boolean {
  if (group.children.length === 0) return true;

  if (group.condition === 'AND') {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      const result = child.type === 'group' 
        ? evaluateRuleGroup(stock, child) 
        : evaluateRule(stock, child);
      if (!result) return false;
    }
    return true;
  } else {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      const result = child.type === 'group' 
        ? evaluateRuleGroup(stock, child) 
        : evaluateRule(stock, child);
      if (result) return true;
    }
    return false;
  }
}

export function useFilters(stocks: Stock[]): Stock[] {
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const priceRange = useFilterStore((s) => s.priceRange);
  const peRange = useFilterStore((s) => s.peRange);
  const marketCapRange = useFilterStore((s) => s.marketCapRange);
  const volumeRange = useFilterStore((s) => s.volumeRange);
  const selectedSectors = useFilterStore((s) => s.selectedSectors);
  const marketCapCategory = useFilterStore((s) => s.marketCapCategory);
  const customRules = useFilterStore((s) => s.customRules);

  const setBenchmark = useStockStore((s) => s.setBenchmark);

  return useMemo(() => {
    const start = performance.now();
    const query = searchQuery.trim().toLowerCase();

    const result = stocks.filter((stock) => {
      // 1. Debounced / instant text search (matches ticker or name)
      if (query) {
        const symbolMatch = stock.symbol.toLowerCase().includes(query);
        const nameMatch = stock.name.toLowerCase().includes(query);
        if (!symbolMatch && !nameMatch) return false;
      }

      // 2. Price range check
      if (stock.price < priceRange.min || stock.price > priceRange.max) {
        return false;
      }

      // 3. PE ratio check
      if (stock.peRatio === null) {
        // If unprofitable, only include if range minimum starts at 0 or below
        if (peRange.min > 0) return false;
      } else {
        if (stock.peRatio < peRange.min || stock.peRatio > peRange.max) {
          return false;
        }
      }

      // 4. Market cap range check
      if (stock.marketCap < marketCapRange.min || stock.marketCap > marketCapRange.max) {
        return false;
      }

      // 5. Volume range check
      if (stock.volume < volumeRange.min || stock.volume > volumeRange.max) {
        return false;
      }

      // 6. Sector selection (multi-select)
      if (selectedSectors.length > 0) {
        if (!selectedSectors.includes(stock.sector)) return false;
      }

      // 7. Market cap tier category
      if (marketCapCategory !== 'All') {
        const mcap = stock.marketCap;
        if (marketCapCategory === 'Mega' && mcap <= 200e9) return false;
        if (marketCapCategory === 'Large' && (mcap <= 10e9 || mcap > 200e9)) return false;
        if (marketCapCategory === 'Mid' && (mcap <= 2e9 || mcap > 10e9)) return false;
        if (marketCapCategory === 'Small' && mcap > 2e9) return false;
      }

      // 8. Custom nested AND/OR builder evaluation
      if (!evaluateRuleGroup(stock, customRules)) {
        return false;
      }

      return true;
    });

    const end = performance.now();
    
    // Update filtering duration benchmark in background
    setTimeout(() => {
      setBenchmark({
        filterExecutionTimeMs: Number((end - start).toFixed(2)),
      });
    }, 0);

    return result;
  }, [
    stocks,
    searchQuery,
    priceRange,
    peRange,
    marketCapRange,
    volumeRange,
    selectedSectors,
    marketCapCategory,
    customRules,
    setBenchmark,
  ]);
}
