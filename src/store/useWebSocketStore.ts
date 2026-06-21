import { create } from 'zustand';
import { webSocketService } from '../services/websocket';

interface WebSocketState {
  status: 'connected' | 'disconnected' | 'reconnecting';
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  setStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: 'disconnected',
  connect: () => {
    webSocketService.connect();
  },
  disconnect: () => {
    webSocketService.disconnect();
  },
  reconnect: () => {
    webSocketService.reconnect();
  },
  setStatus: (status) => set({ status }),
}));

// Initialize connection sync in client environment
if (typeof window !== 'undefined') {
  webSocketService.onStatusChange((status) => {
    useWebSocketStore.getState().setStatus(status);
  });
}
