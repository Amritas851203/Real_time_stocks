import { useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { useUiStore } from '../store/useUiStore';
import { webSocketService } from '../services/websocket';

export function useWebSocket() {
  const updateStocksRealTime = useStockStore((s) => s.updateStocksRealTime);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    // Subscribe to WebSocket message ticks
    const unsubscribeMessage = webSocketService.onMessage((updates) => {
      updateStocksRealTime(updates);
    });

    // Subscribe to connection status shifts for visual alert toasts
    let prevStatus = webSocketService.getStatus();
    const unsubscribeStatus = webSocketService.onStatusChange((status) => {
      if (status !== prevStatus) {
        if (status === 'connected') {
          showToast('WebSocket connected. Real-time updates active!', 'success');
        } else if (status === 'disconnected') {
          showToast('WebSocket connection closed. Pricing is paused.', 'error');
        } else if (status === 'reconnecting') {
          showToast('Attempting to reconnect to WebSocket...', 'info');
        }
        prevStatus = status;
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
    };
  }, [updateStocksRealTime, showToast]);
}
