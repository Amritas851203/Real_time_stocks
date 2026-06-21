'use client';

import React from 'react';
import { useStockStore } from '../../store/useStockStore';
import MobileStockCard from './StockCard';

export default function StockList() {
  const stocks = useStockStore((s) => s.stocks);
  return (
    <div className="space-y-2">
      {stocks.map((stock) => (
        <MobileStockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
}
