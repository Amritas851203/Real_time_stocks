'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualTable } from '../../../hooks/useVirtualTable';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { Stock } from '../../../types';
import { Star, ArrowUpDown, Eye, Settings2, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface StockTableProps {
  displayStocks: Stock[];
}

export default function StockTable({ displayStocks }: StockTableProps) {
  const watchlist = useStockStore((s) => s.watchlist);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const recentUpdates = useStockStore((s) => s.recentUpdates);
  const setBenchmark = useStockStore((s) => s.setBenchmark);
  const addRecentlyViewed = useStockStore((s) => s.addRecentlyViewed);
  
  const setSelectedSymbol = useUiStore((s) => s.setSelectedSymbol);
  const selectedSymbol = useUiStore((s) => s.selectedSymbol);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'marketCap', desc: true }
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const renderStartTimeRef = useRef(0);
  renderStartTimeRef.current = performance.now();

  useEffect(() => {
    const endRender = performance.now();
    const duration = endRender - renderStartTimeRef.current;
    
    const timer = setTimeout(() => {
      setBenchmark({
        renderTimeMs: Number(duration.toFixed(2)),
        renderedRowCount: displayStocks.length,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [displayStocks, sorting, setBenchmark]);

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Define table columns with custom badges, sparklines, and style changes
  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        id: 'watchlist',
        header: '',
        size: 40,
        enableResizing: false,
        cell: ({ row }) => {
          const isStarred = watchlist.includes(row.original.symbol);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(row.original.symbol);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isStarred ? 'text-amber-400 hover:text-amber-300' : 'text-gray-655 hover:text-gray-400'
              }`}
              title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
            </button>
          );
        },
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        size: 110,
        cell: ({ row }) => {
          const isSelected = selectedSymbol === row.original.symbol;
          return (
            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border transition-all select-none ${
              isSelected 
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-[#0B1220] border-gray-800 text-gray-300 group-hover:border-blue-550/30 group-hover:text-blue-400'
            }`}>
              {row.original.symbol}
            </span>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Company Name',
        size: 180,
        cell: ({ row }) => (
          <span className="text-gray-300 font-semibold truncate block max-w-[160px] text-xs">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 90,
        cell: ({ row }) => (
          <span className="font-extrabold text-right block pr-2 text-gray-100 tabular-nums">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: 'changePercent',
        header: 'Change',
        size: 90,
        cell: ({ row }) => {
          const val = row.original.changePercent;
          const isPos = val >= 0;
          return (
            <span
              className={`font-black text-xs text-right pr-2 flex items-center justify-end tabular-nums ${
                isPos ? 'text-brand-emerald' : 'text-brand-negative'
              }`}
            >
              {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 shrink-0" />}
              {isPos ? '+' : ''}
              {val.toFixed(2)}%
            </span>
          );
        },
      },
      {
        id: 'sparkline',
        header: 'Last 7 Days',
        size: 110,
        enableResizing: false,
        cell: ({ row }) => {
          const symbol = row.original.symbol;
          // Seed generator deterministically based on stock symbol for clean rendering
          let hash = 0;
          for (let i = 0; i < symbol.length; i++) {
            hash = Math.imul(31, hash) + symbol.charCodeAt(i) | 0;
          }
          let s = Math.abs(hash === 0 ? 1 : hash);
          const rand = () => {
            s = Math.imul(48271, s) % 2147483647;
            if (s < 0) s += 2147483647;
            return s / 2147483647;
          };

          const prices: number[] = [];
          let current = 100;
          for (let i = 0; i < 8; i++) {
            current = current * (1 + (rand() - 0.49) * 0.05);
            prices.push(current);
          }

          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const range = max - min === 0 ? 1 : max - min;
          
          const coords = prices.map((p, idx) => {
            const x = (idx / 7) * 90 + 5;
            const y = 22 - ((p - min) / range) * 16;
            return { x, y };
          });
          const pointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
          
          const isUp = prices[7] >= prices[0];
          const stroke = isUp ? '#10B981' : '#EF4444';
          const fillId = `grad-${symbol}`;

          // Area path boundary string
          const pathStr = `M ${coords[0].x},${coords[0].y} ` + coords.map(c => `L ${c.x},${c.y}`).join(' ') + ` L ${coords[coords.length - 1].x},26 L ${coords[0].x},26 Z`;

          return (
            <div className="flex items-center justify-center h-full">
              <svg className="w-20 h-6 overflow-visible" viewBox="0 0 100 26">
                <defs>
                  <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={pathStr} fill={`url(#${fillId})`} />
                <polyline
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsStr}
                />
              </svg>
            </div>
          );
        },
      },
      {
        accessorKey: 'volume',
        header: 'Volume',
        size: 95,
        cell: ({ row }) => (
          <span className="text-gray-400 font-semibold text-right block pr-2 text-xs tabular-nums">
            {formatCompact(row.original.volume)}
          </span>
        ),
      },
      {
        accessorKey: 'marketCap',
        header: 'Market Cap',
        size: 110,
        cell: ({ row }) => (
          <span className="text-blue-400/90 font-black text-right block pr-2 text-xs tabular-nums">
            {formatCompact(row.original.marketCap)}
          </span>
        ),
      },
      {
        accessorKey: 'peRatio',
        header: 'P/E',
        size: 75,
        cell: ({ row }) => {
          const val = row.original.peRatio;
          return (
            <span className="text-gray-400 font-bold text-right block pr-2 text-xs tabular-nums">
              {val !== null ? val.toFixed(1) : 'Unprofitable'}
            </span>
          );
        },
      },
      {
        accessorKey: 'eps',
        header: 'EPS',
        size: 75,
        cell: ({ row }) => (
          <span className="text-gray-400 font-bold text-right block pr-2 text-xs tabular-nums">
            ${row.original.eps.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'sector',
        header: 'Sector',
        size: 130,
        cell: ({ row }) => (
          <span className="text-gray-450 font-bold truncate block text-xs">
            {row.original.sector}
          </span>
        ),
      },
      {
        accessorKey: 'high52',
        header: '52W High',
        size: 90,
        cell: ({ row }) => (
          <span className="text-brand-emerald/90 font-bold text-right block pr-2 text-xs tabular-nums">
            {formatCurrency(row.original.high52)}
          </span>
        ),
      },
      {
        accessorKey: 'low52',
        header: '52W Low',
        size: 90,
        cell: ({ row }) => (
          <span className="text-brand-negative/90 font-bold text-right block pr-2 text-xs tabular-nums">
            {formatCurrency(row.original.low52)}
          </span>
        ),
      },
    ],
    [watchlist, toggleWatchlist, selectedSymbol]
  );

  const table = useReactTable({
    data: displayStocks,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
  });

  const { rows } = table.getRowModel();

  const { parentRef, rowVirtualizer } = useVirtualTable({
    count: rows.length,
    estimateSize: 36,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const handleRowClick = (stock: Stock) => {
    setSelectedSymbol(stock.symbol);
    addRecentlyViewed(stock.symbol);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0B1220] border border-[#1f2937]/50 rounded-xl overflow-hidden relative select-none">
      
      {/* Table Toolbar Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937]/50 bg-[#050816]/30 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Screener Results ({displayStocks.length} listed)
          </span>
        </div>

        {/* Column Display dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#111827] text-gray-300 text-[10px] font-bold border border-[#1f2937]/50 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Columns</span>
          </button>
          
          {showColumnSettings && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111827] border border-[#1f2937]/60 shadow-2xl p-3 z-30">
              <h3 className="text-[10px] font-bold text-gray-300 mb-2 border-b border-[#1f2937]/50 pb-1.5 flex items-center justify-between">
                <span>Display Metrics</span>
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="text-[9px] text-gray-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </h3>
              <div className="max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin">
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'watchlist') return null;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center space-x-2 text-[10px] font-semibold text-gray-400 hover:text-gray-205 cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded border-[#1f2937] bg-[#050816] text-blue-500 focus:ring-blue-500/50 w-3 h-3 cursor-pointer"
                      />
                      <span>
                        {typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="flex-1 overflow-x-auto min-h-0 scrollbar-thin">
        <div className="min-w-[1050px] h-full flex flex-col">
          {/* Sticky Header Row */}
          <div className="bg-[#0B1220] border-b border-[#1f2937]/50 flex shrink-0 sticky top-0 z-20">
            {table.getFlatHeaders().map((header) => {
              const isSortable = header.column.getCanSort();
              return (
                <div
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest select-none relative flex items-center shrink-0 border-r border-[#1f2937]/30"
                >
                  {isSortable ? (
                    <button
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center space-x-1.5 hover:text-gray-200 text-left font-black cursor-pointer"
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-500 shrink-0" />
                    </button>
                  ) : (
                    <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                  )}

                  {/* Resizer bar */}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/40 select-none ${
                        header.column.getIsResizing() ? 'bg-blue-500 w-1' : ''
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Body - virtualized */}
          <div
            ref={parentRef}
            className="flex-1 overflow-y-auto relative bg-[#050816]/20 scrollbar-thin"
          >
            {rows.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-2 select-none">
                <Eye className="w-8 h-8 text-gray-650 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">No stocks matching filters</span>
                <span className="text-[9px] text-gray-600">Modify screener rule parameters to inspect listings.</span>
              </div>
            ) : (
              <div
                style={{
                  height: `${totalHeight}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  const stock = row.original;
                  const isSelected = selectedSymbol === stock.symbol;
                  
                  const update = recentUpdates[stock.symbol];
                  
                  // Flash class triggers when real-time updates happen via web-sockets
                  let backgroundClass = isSelected
                    ? 'bg-blue-600/10 border-y border-blue-500/30'
                    : 'hover:bg-[#111827]/40 border-b border-[#1f2937]/30';

                  if (update && Date.now() - update.timestamp < 1000) {
                    backgroundClass = update.direction === 'up' ? 'animate-flash-up' : 'animate-flash-down';
                  }

                  return (
                    <div
                      key={row.id}
                      onClick={() => handleRowClick(stock)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className={`flex items-center cursor-pointer transition-all duration-300 group select-none text-[11px] ${backgroundClass}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <div
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="px-4 py-1.5 shrink-0 overflow-hidden truncate flex items-center h-full"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
