import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualTableProps {
  count: number;
  estimateSize?: number;
  overscan?: number;
}

export function useVirtualTable({ count, estimateSize = 36, overscan = 15 }: UseVirtualTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return {
    parentRef,
    rowVirtualizer,
  };
}
