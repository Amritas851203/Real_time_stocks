'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { Stock, Candle } from '../../../types';
import { generateHistoricalData } from '../../../utils/mockDataGenerator';
import { useUiStore } from '../../../store/useUiStore';
import { useStockStore } from '../../../store/useStockStore';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '../../../utils/indicators';
import { LineChart, Sparkles, Activity } from 'lucide-react';

interface ChartContainerProps {
  stock: Stock;
}

export default function ChartContainer({ stock }: ChartContainerProps) {
  const { theme, chartTimeframe, setChartTimeframe, activeIndicators, toggleIndicator } = useUiStore();
  const recentUpdates = useStockStore((s) => s.recentUpdates);

  const priceContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const chartsRef = useRef<{
    priceChart: IChartApi | null;
    rsiChart: IChartApi | null;
    macdChart: IChartApi | null;
  }>({ priceChart: null, rsiChart: null, macdChart: null });

  const seriesRef = useRef<{
    candlestick: ISeriesApi<'Candlestick'> | null;
    volume: ISeriesApi<'Histogram'> | null;
    sma: ISeriesApi<'Line'> | null;
    ema: ISeriesApi<'Line'> | null;
    bbUpper: ISeriesApi<'Line'> | null;
    bbMiddle: ISeriesApi<'Line'> | null;
    bbLower: ISeriesApi<'Line'> | null;
    rsi: ISeriesApi<'Line'> | null;
    macdLine: ISeriesApi<'Line'> | null;
    macdSignal: ISeriesApi<'Line'> | null;
    macdHist: ISeriesApi<'Histogram'> | null;
  }>({
    candlestick: null,
    volume: null,
    sma: null,
    ema: null,
    bbUpper: null,
    bbMiddle: null,
    bbLower: null,
    rsi: null,
    macdLine: null,
    macdSignal: null,
    macdHist: null,
  });

  const fullHistory = useMemo(() => {
    return generateHistoricalData(stock.symbol, stock.price, 180);
  }, [stock.symbol, stock.price]);

  const history = useMemo(() => {
    switch (chartTimeframe) {
      case '1D':
        return fullHistory.slice(-30);
      case '1W':
        return fullHistory.slice(-60);
      case '1M':
        return fullHistory.slice(-90);
      case '1Y':
        return fullHistory.slice(-150);
      default:
        return fullHistory;
    }
  }, [fullHistory, chartTimeframe]);

  useEffect(() => {
    const update = recentUpdates[stock.symbol];
    if (!update || history.length === 0) return;

    const { candlestick, volume, sma, ema, bbUpper, bbMiddle, bbLower, rsi, macdLine, macdSignal, macdHist } = seriesRef.current;
    if (!candlestick) return;

    const lastIdx = history.length - 1;
    const lastCandle = { ...history[lastIdx] };
    
    lastCandle.close = stock.price;
    lastCandle.high = Math.max(lastCandle.high, stock.price);
    lastCandle.low = Math.min(lastCandle.low, stock.price);
    lastCandle.volume = stock.volume;
    
    candlestick.update(lastCandle);

    if (volume) {
      volume.update({
        time: lastCandle.time,
        value: stock.volume,
        color: stock.price >= lastCandle.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
      });
    }

    const updatedHistory = [...history.slice(0, -1), lastCandle];

    if (activeIndicators.sma && sma) {
      const smaData = calculateSMA(updatedHistory, 14);
      if (smaData.length > 0) sma.update(smaData[smaData.length - 1]);
    }
    if (activeIndicators.ema && ema) {
      const emaData = calculateEMA(updatedHistory, 20);
      if (emaData.length > 0) ema.update(emaData[emaData.length - 1]);
    }
    if (activeIndicators.bb && bbUpper && bbMiddle && bbLower) {
      const bbData = calculateBollingerBands(updatedHistory, 20, 2);
      if (bbData.upper.length > 0) {
        bbUpper.update(bbData.upper[bbData.upper.length - 1]);
        bbMiddle.update(bbData.middle[bbData.middle.length - 1]);
        bbLower.update(bbData.lower[bbData.lower.length - 1]);
      }
    }
    if (activeIndicators.rsi && rsi) {
      const rsiData = calculateRSI(updatedHistory, 14);
      if (rsiData.length > 0) rsi.update(rsiData[rsiData.length - 1]);
    }
    if (activeIndicators.macd && macdLine && macdSignal && macdHist) {
      const macdData = calculateMACD(updatedHistory);
      if (macdData.macd.length > 0) {
        macdLine.update(macdData.macd[macdData.macd.length - 1]);
        macdSignal.update(macdData.signal[macdData.signal.length - 1]);
        macdHist.update(macdData.histogram[macdData.histogram.length - 1]);
      }
    }
  }, [recentUpdates, stock.symbol, stock.price, stock.volume, history, activeIndicators]);

  useEffect(() => {
    if (!priceContainerRef.current) return;

    priceContainerRef.current.innerHTML = '';
    if (rsiContainerRef.current) rsiContainerRef.current.innerHTML = '';
    if (macdContainerRef.current) macdContainerRef.current.innerHTML = '';

    const width = priceContainerRef.current.clientWidth;
    const isLight = theme === 'light';
    const chartBg = isLight ? '#ffffff' : '#111827';
    const chartText = isLight ? '#475569' : '#9ca3af';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(31, 41, 55, 0.4)';
    const borderColor = isLight ? '#e2e8f0' : 'rgba(31, 41, 55, 0.8)';

    const commonChartOptions = {
      width,
      layout: {
        background: { color: chartBg },
        textColor: chartText,
        fontSize: 10,
        fontFamily: 'var(--font-sans)',
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
      },
    };

    const priceChart = createChart(priceContainerRef.current, {
      ...commonChartOptions,
      height: 280,
    });
    chartsRef.current.priceChart = priceChart;

    const candlestick = priceChart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });
    candlestick.setData(history);
    seriesRef.current.candlestick = candlestick;

    const volume = priceChart.addSeries(HistogramSeries, {
      color: '#10B981',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume-scale',
    });
    const volumeData = history.map((h) => ({
      time: h.time,
      value: h.volume,
      color: h.close >= h.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
    }));
    volume.setData(volumeData);
    seriesRef.current.volume = volume;

    priceChart.priceScale('volume-scale').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    let sma: ISeriesApi<'Line'> | null = null;
    if (activeIndicators.sma) {
      sma = priceChart.addSeries(LineSeries, {
        color: '#3B82F6',
        lineWidth: 2,
        title: 'SMA (14)',
      });
      sma.setData(calculateSMA(history, 14));
      seriesRef.current.sma = sma;
    }

    let ema: ISeriesApi<'Line'> | null = null;
    if (activeIndicators.ema) {
      ema = priceChart.addSeries(LineSeries, {
        color: '#F59E0B',
        lineWidth: 2,
        title: 'EMA (20)',
      });
      ema.setData(calculateEMA(history, 20));
      seriesRef.current.ema = ema;
    }

    if (activeIndicators.bb) {
      const bbData = calculateBollingerBands(history, 20, 2);
      
      const bbUpper = priceChart.addSeries(LineSeries, {
        color: 'rgba(168, 85, 247, 0.5)',
        lineWidth: 1,
        title: 'BB Upper',
      });
      bbUpper.setData(bbData.upper);
      seriesRef.current.bbUpper = bbUpper;

      const bbMiddle = priceChart.addSeries(LineSeries, {
        color: 'rgba(168, 85, 247, 0.3)',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Basis',
      });
      bbMiddle.setData(bbData.middle);
      seriesRef.current.bbMiddle = bbMiddle;

      const bbLower = priceChart.addSeries(LineSeries, {
        color: 'rgba(168, 85, 247, 0.5)',
        lineWidth: 1,
        title: 'BB Lower',
      });
      bbLower.setData(bbData.lower);
      seriesRef.current.bbLower = bbLower;
    }

    let rsiChart: IChartApi | null = null;
    if (activeIndicators.rsi && rsiContainerRef.current) {
      rsiChart = createChart(rsiContainerRef.current, {
        ...commonChartOptions,
        height: 90,
      });
      chartsRef.current.rsiChart = rsiChart;

      const rsiLine = rsiChart.addSeries(LineSeries, {
        color: '#EC4899',
        lineWidth: 2,
        title: 'RSI (14)',
      });
      rsiLine.setData(calculateRSI(history, 14));
      seriesRef.current.rsi = rsiLine;

      const limit30 = rsiChart.addSeries(LineSeries, {
        color: 'rgba(239, 68, 68, 0.2)',
        lineWidth: 1,
        lineStyle: 3,
      });
      limit30.setData(history.map((h) => ({ time: h.time, value: 30 })));
      
      const limit70 = rsiChart.addSeries(LineSeries, {
        color: 'rgba(16, 185, 129, 0.2)',
        lineWidth: 1,
        lineStyle: 3,
      });
      limit70.setData(history.map((h) => ({ time: h.time, value: 70 })));
    }

    let macdChart: IChartApi | null = null;
    if (activeIndicators.macd && macdContainerRef.current) {
      macdChart = createChart(macdContainerRef.current, {
        ...commonChartOptions,
        height: 100,
      });
      chartsRef.current.macdChart = macdChart;

      const macdData = calculateMACD(history);

      const mLine = macdChart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        title: 'MACD',
      });
      mLine.setData(macdData.macd);
      seriesRef.current.macdLine = mLine;

      const sLine = macdChart.addSeries(LineSeries, {
        color: '#f97316',
        lineWidth: 2,
        title: 'Signal',
      });
      sLine.setData(macdData.signal);
      seriesRef.current.macdSignal = sLine;

      const hist = macdChart.addSeries(HistogramSeries, {
        title: 'Histogram',
      });
      hist.setData(macdData.histogram.map((h) => ({
        ...h,
        color: h.value >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      })));
      seriesRef.current.macdHist = hist;
    }

    let isMounted = true;

    const priceScale = priceChart.timeScale();
    const rsiScale = rsiChart?.timeScale();
    const macdScale = macdChart?.timeScale();

    const handleVisibleTimeRangeChange = (newRange: any) => {
      if (!isMounted || !newRange) return;
      try {
        if (rsiScale) rsiScale.setVisibleRange(newRange);
      } catch (err) {
        // Safe check for timescale synchronization latency
      }
      try {
        if (macdScale) macdScale.setVisibleRange(newRange);
      } catch (err) {
        // Safe check for timescale synchronization latency
      }
    };

    priceScale.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMounted || entries.length === 0 || !entries[0].contentRect) return;
      const newWidth = entries[0].contentRect.width;
      
      priceChart.resize(newWidth, 280);
      if (rsiChart) rsiChart.resize(newWidth, 90);
      if (macdChart) macdChart.resize(newWidth, 100);
    });

    resizeObserver.observe(priceContainerRef.current);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      priceScale.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
      priceChart.remove();
      if (rsiChart) rsiChart.remove();
      if (macdChart) macdChart.remove();
      
      chartsRef.current = { priceChart: null, rsiChart: null, macdChart: null };
      seriesRef.current = {
        candlestick: null,
        volume: null,
        sma: null,
        ema: null,
        bbUpper: null,
        bbMiddle: null,
        bbLower: null,
        rsi: null,
        macdLine: null,
        macdSignal: null,
        macdHist: null,
      };
    };
  }, [history, activeIndicators, theme]);

  return (
    <div className="space-y-3">
      {/* Timeframe & Indicators Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111827] border border-[#1f2937]/50 rounded-xl select-none">
        
        {/* Timeframe selector */}
        <div className="flex items-center space-x-1.5 bg-[#0B1220] p-1 rounded-lg border border-[#1f2937]/30">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setChartTimeframe(tf)}
              className={`px-3 py-1 rounded text-[10px] font-black transition-all cursor-pointer ${
                chartTimeframe === tf
                  ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators checklist toggles */}
        <div className="flex items-center space-x-2 text-[10px] font-bold">
          <span className="text-gray-550 flex items-center mr-1 tracking-wider uppercase text-[9px]">
            <Activity className="w-3.5 h-3.5 text-blue-400 mr-1" />
            Indicators
          </span>

          <button
            onClick={() => toggleIndicator('sma')}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
              activeIndicators.sma
                ? 'bg-blue-600/10 border-blue-500/45 text-blue-400'
                : 'bg-[#0B1220] border-[#1f2937]/40 text-gray-450 hover:text-gray-250 hover:border-gray-700'
            }`}
          >
            SMA (14)
          </button>

          <button
            onClick={() => toggleIndicator('ema')}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
              activeIndicators.ema
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/45 text-[#F59E0B]'
                : 'bg-[#0B1220] border-[#1f2937]/40 text-gray-450 hover:text-gray-250 hover:border-gray-700'
            }`}
          >
            EMA (20)
          </button>

          <button
            onClick={() => toggleIndicator('bb')}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
              activeIndicators.bb
                ? 'bg-purple-600/10 border-purple-500/45 text-purple-400'
                : 'bg-[#0B1220] border-[#1f2937]/40 text-gray-450 hover:text-gray-250 hover:border-gray-700'
            }`}
          >
            BB (20,2)
          </button>

          <button
            onClick={() => toggleIndicator('rsi')}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
              activeIndicators.rsi
                ? 'bg-pink-600/10 border-pink-500/45 text-pink-400'
                : 'bg-[#0B1220] border-[#1f2937]/40 text-gray-450 hover:text-gray-250 hover:border-gray-700'
            }`}
          >
            RSI (14)
          </button>

          <button
            onClick={() => toggleIndicator('macd')}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
              activeIndicators.macd
                ? 'bg-emerald-600/10 border-emerald-500/45 text-emerald-450'
                : 'bg-[#0B1220] border-[#1f2937]/40 text-gray-450 hover:text-gray-250 hover:border-gray-700'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* Lightweight Canvas container */}
      <div className="border border-[#1f2937]/50 rounded-xl overflow-hidden bg-[#111827] p-2 relative shadow-lg">
        {/* Main Price Candlestick Chart */}
        <div ref={priceContainerRef} className="w-full h-[280px] select-none" />

        {/* RSI Pane */}
        {activeIndicators.rsi && (
          <div className="border-t border-[#1f2937]/50 mt-1.5 pt-1.5">
            <div className="text-[9px] font-black text-pink-450 mb-1 px-2 select-none uppercase tracking-wider">RSI (14)</div>
            <div ref={rsiContainerRef} className="w-full h-[90px] select-none" />
          </div>
        )}

        {/* MACD Pane */}
        {activeIndicators.macd && (
          <div className="border-t border-[#1f2937]/50 mt-1.5 pt-1.5">
            <div className="text-[9px] font-black text-blue-450 mb-1 px-2 select-none uppercase tracking-wider">MACD (12, 26, 9)</div>
            <div ref={macdContainerRef} className="w-full h-[100px] select-none" />
          </div>
        )}
      </div>
    </div>
  );
}
