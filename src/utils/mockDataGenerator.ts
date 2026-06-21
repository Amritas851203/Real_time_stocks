import { Stock, Candle, MarketOverview } from '../types';

export function createRandom(seed: string | number) {
  let h = 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
  } else {
    h = seed | 0;
  }
  
  let s = h === 0 ? 1 : Math.abs(h);
  return function() {
    s = Math.imul(48271, s) % 2147483647;
    if (s < 0) s += 2147483647;
    return s / 2147483647;
  };
}

const SECTORS = [
  { name: 'Technology', prefix: 'TECH', basePrice: 150, peRange: [15, 80], capRange: [1e9, 3e12] },
  { name: 'Financials', prefix: 'FIN', basePrice: 80, peRange: [8, 25], capRange: [5e8, 6e11] },
  { name: 'Healthcare', prefix: 'HLTH', basePrice: 120, peRange: [15, 60], capRange: [8e8, 5e11] },
  { name: 'Energy', prefix: 'ENRG', basePrice: 60, peRange: [6, 18], capRange: [5e8, 4e11] },
  { name: 'Industrials', prefix: 'IND', basePrice: 90, peRange: [12, 35], capRange: [3e8, 3e11] },
  { name: 'Consumer Cyclical', prefix: 'CYCL', basePrice: 110, peRange: [14, 50], capRange: [4e8, 8e11] },
  { name: 'Consumer Defensive', prefix: 'DEFN', basePrice: 75, peRange: [12, 30], capRange: [6e8, 4e11] },
  { name: 'Utilities', prefix: 'UTIL', basePrice: 55, peRange: [10, 22], capRange: [2e8, 1.5e11] },
  { name: 'Basic Materials', prefix: 'MAT', basePrice: 65, peRange: [8, 20], capRange: [1.5e8, 1.2e11] },
  { name: 'Real Estate', prefix: 'RESE', basePrice: 40, peRange: [15, 45], capRange: [1e8, 1e11] },
];

const ADJECTIVES = [
  'Apex', 'Alpha', 'Vertex', 'Horizon', 'Quantum', 'Matrix', 'Nexus', 'Omega', 'Cyber', 'Solar',
  'Eco', 'Nova', 'Synapse', 'Stellar', 'Zenith', 'Prime', 'Core', 'Delta', 'Beacon', 'Aether',
  'Vanguard', 'Pinnacle', 'Summit', 'Infinity', 'Zephyr', 'Orion', 'Polaris', 'Titan', 'Aero', 'Bio'
];

const NOUNS = [
  'Systems', 'Technologies', 'Labs', 'Partners', 'Group', 'Capital', 'Ventures', 'Dynamics', 'Power',
  'Resources', 'Therapeutics', 'Bio', 'Trust', 'Industries', 'Solutions', 'Global', 'Networks',
  'Software', 'Devices', 'Energy', 'Mining', 'Materials', 'Micro', 'Genetics', 'Security', 'Logistics'
];

export function generateHistoricalData(symbol: string, currentPrice: number, days: number = 150): Candle[] {
  const rand = createRandom(symbol + '_history');
  const history: Candle[] = [];
  
  let price = currentPrice;
  const now = new Date();
  
  // Start days ago
  const dateCursor = new Date(now);
  dateCursor.setDate(now.getDate() - days);

  for (let i = 0; i < days; i++) {
    // Generate daily movements
    const volatility = 0.025; // 2.5% max daily move
    const percentChange = (rand() - 0.49) * volatility; // slight upward bias
    
    const open = price * (1 - percentChange);
    const close = price;
    
    const dayVolatility = rand() * volatility;
    const high = Math.max(open, close) * (1 + dayVolatility * 0.5);
    const low = Math.min(open, close) * (1 - dayVolatility * 0.5);
    const volume = Math.floor(rand() * 1000000) + 50000;
    
    // Format date as YYYY-MM-DD
    const yyyy = dateCursor.getFullYear();
    const mm = String(dateCursor.getMonth() + 1).padStart(2, '0');
    const dd = String(dateCursor.getDate()).padStart(2, '0');
    const timeStr = `${yyyy}-${mm}-${dd}`;

    history.push({
      time: timeStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
    
    // Move forward in time (tomorrow's open is close * minor noise)
    price = price * (1 + (rand() - 0.5) * 0.005);
    
    // Increment date, skipping weekends (optional, but standard for market charts is weekdays)
    dateCursor.setDate(dateCursor.getDate() + 1);
    // If weekend, skip to Monday
    if (dateCursor.getDay() === 0) { // Sunday
      dateCursor.setDate(dateCursor.getDate() + 1);
    } else if (dateCursor.getDay() === 6) { // Saturday
      dateCursor.setDate(dateCursor.getDate() + 2);
    }
  }

  // Adjust final candle to match exactly currentPrice
  if (history.length > 0) {
    const last = history[history.length - 1];
    const diff = currentPrice - last.close;
    last.close = Number(currentPrice.toFixed(2));
    last.open = Number((last.open + diff).toFixed(2));
    last.high = Number(Math.max(last.open, last.close, last.high).toFixed(2));
    last.low = Number(Math.min(last.open, last.close, last.low).toFixed(2));
  }

  return history;
}

export function generateStocks(count: number = 5050): Stock[] {
  const rand = createRandom('stocks_dataset_seed');
  const stocks: Stock[] = [];
  const symbolTracker = new Set<string>();

  for (let i = 1; i <= count; i++) {
    const sectorInfo = SECTORS[i % SECTORS.length];
    
    // Determine a unique ticker symbol
    let symbol = '';
    let duplicateCheck = true;
    let name = '';

    while (duplicateCheck) {
      const adjIndex = Math.floor(rand() * ADJECTIVES.length);
      const nounIndex = Math.floor(rand() * NOUNS.length);
      const adj = ADJECTIVES[adjIndex];
      const noun = NOUNS[nounIndex];
      
      name = `${adj} ${noun}`;
      // Append Inc. or Corp.
      if (rand() > 0.5) {
        name += rand() > 0.5 ? ' Corp.' : ' Inc.';
      } else {
        name += ' Group';
      }

      // Symbol abbreviations
      const tickerBase = (adj.substring(0, 2) + noun.substring(0, 2)).toUpperCase();
      const numSuffix = String(Math.floor(i / SECTORS.length) + 100).padStart(3, '0');
      symbol = `${sectorInfo.prefix}_${tickerBase}${numSuffix}`;
      
      if (!symbolTracker.has(symbol)) {
        symbolTracker.add(symbol);
        duplicateCheck = false;
      }
    }

    // Base price + random variance
    const priceMultiplier = 0.2 + rand() * 4.8;
    const price = Number((sectorInfo.basePrice * priceMultiplier).toFixed(2));

    // Change percent: -10% to +10%
    const changePercent = Number(((rand() - 0.495) * 8).toFixed(2)); // slight daily positive bias

    // Volume: 1k to 10M
    const volumeMultiplier = rand() * rand() * 100;
    const volume = Math.floor(1000 + volumeMultiplier * 100000);

    // Market cap: capRange minimum * variance
    const rangeMin = sectorInfo.capRange[0];
    const rangeMax = sectorInfo.capRange[1];
    const marketCap = Math.floor(rangeMin + rand() * rand() * (rangeMax - rangeMin));

    // P/E Ratio: unprofitable in ~12% of cases, else random in range
    const isUnprofitable = rand() < 0.12;
    const peRatio = isUnprofitable
      ? null
      : Number((sectorInfo.peRange[0] + rand() * (sectorInfo.peRange[1] - sectorInfo.peRange[0])).toFixed(2));

    // EPS: mathematically tied to PE if profitable, else negative
    const eps = peRatio !== null
      ? Number((price / peRatio).toFixed(2))
      : Number((-(rand() * 5)).toFixed(2));

    // 52-week high and low
    const yearLowMult = 0.5 + rand() * 0.45; // low is 50%-95% of current price
    const yearHighMult = 1.05 + rand() * 1.2; // high is 105%-225% of current price
    
    const low52 = Number((price * yearLowMult).toFixed(2));
    const high52 = Number((price * yearHighMult).toFixed(2));

    // ROE, Debt/Equity, Div Yield
    const roe = Number(((rand() - 0.2) * 45).toFixed(2));
    const debtEquity = Number((rand() * (sectorInfo.prefix === 'FIN' || sectorInfo.prefix === 'UTIL' ? 2.5 : 1.2)).toFixed(2));
    const dividendYield = Number((rand() > 0.4 ? rand() * (sectorInfo.prefix === 'UTIL' || sectorInfo.prefix === 'DEFN' ? 6.0 : 3.5) : 0).toFixed(2));

    stocks.push({
      symbol,
      name,
      price,
      changePercent,
      volume,
      marketCap,
      peRatio,
      eps,
      roe,
      debtEquity,
      dividendYield,
      sector: sectorInfo.name,
      low52,
      high52,
      // Generate history on-demand. Empty here to save memory in the main store list.
      history: [],
    });
  }

  return stocks;
}

export function getMarketOverview(): MarketOverview[] {
  // We can generate stable indices
  return [
    { symbol: '^NSEI', name: 'Nifty 50', price: 24812.25, change: 330.40, changePercent: 1.35 },
    { symbol: '^BSESN', name: 'SENSEX', price: 81458.66, change: 1030.20, changePercent: 1.28 },
    { symbol: '^IXIC', name: 'NASDAQ', price: 17721.59, change: -5.31, changePercent: -0.03 },
    { symbol: '^DJI', name: 'Dow Jones', price: 38834.86, change: 56.22, changePercent: 0.15 },
    { symbol: '^GSPC', name: 'S&P 500', price: 5487.03, change: 13.80, changePercent: 0.25 }
  ];
}

export interface FinancialStatementYear {
  year: string;
  revenue: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  equity: number;
  cashFlow: number;
}

export function generateFinancials(symbol: string): FinancialStatementYear[] {
  const rand = createRandom(symbol + '_financials');
  const years = ['2023', '2024', '2025'];
  
  // Base numbers seeded from symbol name length and characters
  let baseVal = 100000000;
  for (let i = 0; i < symbol.length; i++) {
    baseVal += symbol.charCodeAt(i) * 5000000;
  }

  const financials: FinancialStatementYear[] = [];
  let currentRev = baseVal;
  
  for (const year of years) {
    const growth = 1 + (rand() - 0.45) * 0.15; // -6.75% to +15.75% growth
    currentRev = Math.round(currentRev * growth);
    
    const margin = 0.05 + rand() * 0.18; // 5% to 23% net margin
    const netIncome = Math.round(currentRev * margin);
    
    const assets = Math.round(currentRev * (0.8 + rand() * 0.5));
    const debtRatio = 0.2 + rand() * 0.5; // 20% to 70% debt
    const liabilities = Math.round(assets * debtRatio);
    const equity = assets - liabilities;
    
    const cashFlow = Math.round(netIncome * (0.9 + rand() * 0.3));

    financials.push({
      year,
      revenue: currentRev,
      netIncome,
      assets,
      liabilities,
      equity,
      cashFlow,
    });
  }

  return financials;
}
