import { Candle } from '../types';

export interface TimeValue {
  time: string;
  value: number;
}

export interface MACDResult {
  macd: TimeValue[];
  signal: TimeValue[];
  histogram: { time: string; value: number; color: string }[];
}

export interface BollingerBandsResult {
  upper: TimeValue[];
  middle: TimeValue[];
  lower: TimeValue[];
}

// Simple Moving Average (SMA)
export function calculateSMA(candles: Candle[], period: number): TimeValue[] {
  const result: TimeValue[] = [];
  if (candles.length < period) return result;

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }
  return result;
}

// Exponential Moving Average (EMA)
export function calculateEMA(candles: Candle[], period: number): TimeValue[] {
  const result: TimeValue[] = [];
  if (candles.length < period) return result;

  // First EMA is simple SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  result.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(2)),
  });

  const multiplier = 2 / (period + 1);

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const ema = (currentClose - prevEma) * multiplier + prevEma;
    result.push({
      time: candles[i].time,
      value: Number(ema.toFixed(2)),
    });
    prevEma = ema;
  }
  return result;
}

// Relative Strength Index (RSI)
export function calculateRSI(candles: Candle[], period: number = 14): TimeValue[] {
  const result: TimeValue[] = [];
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  // First change
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push({
    time: candles[period].time,
    value: Number(rsi.toFixed(2)),
  });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

// Moving Average Convergence Divergence (MACD)
export function calculateMACD(
  candles: Candle[],
  shortPeriod: number = 12,
  longPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const result: MACDResult = { macd: [], signal: [], histogram: [] };
  if (candles.length < longPeriod) return result;

  const ema12 = calculateEMA(candles, shortPeriod);
  const ema26 = calculateEMA(candles, longPeriod);

  // We need to align these two
  const macdValues: TimeValue[] = [];
  const ema12Map = new Map(ema12.map((item) => [item.time, item.value]));

  for (const item26 of ema26) {
    const val12 = ema12Map.get(item26.time);
    if (val12 !== undefined) {
      macdValues.push({
        time: item26.time,
        value: Number((val12 - item26.value).toFixed(2)),
      });
    }
  }

  if (macdValues.length < signalPeriod) return result;

  // Signal line is EMA of MACD
  // Convert macdValues to standard Candle structure to reuse calculateEMA
  const macdAsCandles: Candle[] = macdValues.map((v) => ({
    time: v.time,
    open: v.value,
    high: v.value,
    low: v.value,
    close: v.value,
    volume: 0,
  }));

  const signalValues = calculateEMA(macdAsCandles, signalPeriod);
  const signalMap = new Map(signalValues.map((item) => [item.time, item.value]));

  for (const macdItem of macdValues) {
    const signalVal = signalMap.get(macdItem.time);
    if (signalVal !== undefined) {
      const histVal = Number((macdItem.value - signalVal).toFixed(2));
      const color = histVal >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'; // Tailwind green-500, red-500
      
      result.macd.push(macdItem);
      result.signal.push({ time: macdItem.time, value: signalVal });
      result.histogram.push({
        time: macdItem.time,
        value: histVal,
        color,
      });
    }
  }

  return result;
}

// Bollinger Bands
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  multiplier: number = 2
): BollingerBandsResult {
  const result: BollingerBandsResult = { upper: [], middle: [], lower: [] };
  if (candles.length < period) return result;

  const sma20 = calculateSMA(candles, period);
  const smaMap = new Map(sma20.map((item) => [item.time, item.value]));

  for (let i = period - 1; i < candles.length; i++) {
    const time = candles[i].time;
    const midVal = smaMap.get(time);
    if (midVal === undefined) continue;

    // Calculate variance
    let sumSquares = 0;
    for (let j = 0; j < period; j++) {
      const diff = candles[i - j].close - midVal;
      sumSquares += diff * diff;
    }
    const stdDev = Math.sqrt(sumSquares / period);

    const upperVal = Number((midVal + multiplier * stdDev).toFixed(2));
    const lowerVal = Number((midVal - multiplier * stdDev).toFixed(2));

    result.middle.push({ time, value: midVal });
    result.upper.push({ time, value: upperVal });
    result.lower.push({ time, value: lowerVal });
  }

  return result;
}
