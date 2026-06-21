export interface Candle {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
  eps: number;
  roe: number;
  debtEquity: number;
  dividendYield: number;
  sector: string;
  high52: number;
  low52: number;
  history: Candle[];
}

export interface FilterRange {
  min: number;
  max: number;
}

export type FilterField =
  | 'price'
  | 'peRatio'
  | 'marketCap'
  | 'volume'
  | 'eps'
  | 'high52'
  | 'low52'
  | 'changePercent'
  | 'sector'
  | 'name'
  | 'symbol';

export type RuleOperator = 'gt' | 'lt' | 'eq' | 'contains' | 'in';

export interface CustomRule {
  id: string;
  type: 'rule';
  field: FilterField;
  operator: RuleOperator;
  value: string | number | string[];
}

export interface CustomRuleGroup {
  id: string;
  type: 'group';
  condition: 'AND' | 'OR';
  children: (CustomRule | CustomRuleGroup)[];
}

export interface SavedPreset {
  id: string;
  name: string;
  description: string;
  ranges: {
    price: FilterRange;
    peRatio: FilterRange;
    marketCap: FilterRange;
    volume: FilterRange;
  };
  sectors: string[];
  customRules: CustomRuleGroup | null;
}

export interface MarketOverview {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface WebSocketUpdate {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface BenchmarkStats {
  filterExecutionTimeMs: number;
  renderTimeMs: number;
  renderedRowCount: number;
  fps: number;
  estimatedMemoryMb: number | null;
}

export interface Holding {
  symbol: string;
  shares: number;
  buyPrice: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  thresholdValue: number;
  status: 'active' | 'triggered';
  triggeredAt?: number;
}
