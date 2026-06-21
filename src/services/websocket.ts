import { WebSocketUpdate, Stock } from '../types';

type StatusCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void;
type MessageCallback = (updates: WebSocketUpdate[]) => void;

class MockWebSocketService {
  private status: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private intervalId: NodeJS.Timeout | null = null;
  private statusCallbacks: Set<StatusCallback> = new Set();
  private messageCallbacks: Set<MessageCallback> = new Set();
  private reconnectionTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-connect on startup in browser
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public connect() {
    if (this.status === 'connected' || this.status === 'reconnecting') return;

    this.setStatus('reconnecting');

    // Simulate connection lag
    this.reconnectionTimeoutId = setTimeout(() => {
      this.setStatus('connected');
      this.startSimulation();
    }, 1500);
  }

  public disconnect() {
    this.setStatus('disconnected');
    this.stopSimulation();
    if (this.reconnectionTimeoutId) {
      clearTimeout(this.reconnectionTimeoutId);
      this.reconnectionTimeoutId = null;
    }
  }

  public reconnect() {
    this.disconnect();
    this.connect();
  }

  public onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.status); // Immediately push current status
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  public onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  private setStatus(newStatus: 'connected' | 'disconnected' | 'reconnecting') {
    this.status = newStatus;
    this.statusCallbacks.forEach((cb) => cb(newStatus));
  }

  private startSimulation() {
    this.stopSimulation();

    this.intervalId = setInterval(() => {
      if (this.status !== 'connected') return;

      // Select 30-60 random stocks to update this tick (out of 5000)
      const updateCount = Math.floor(Math.random() * 30) + 30;
      const updates: WebSocketUpdate[] = [];

      // We'll pass the list of symbols dynamically, or generate updates using a reference array
      // In our design, the store will provide access to symbols, or we can just emit updates 
      // where the receiver applies them if they exist.
      // We will listen in the store. To simulate updates, we need symbols. We can let the stock store 
      // subscribe to this service. The service can ask the store for active symbols, or generate updates 
      // for random symbols if we know how the symbols are structured.
      // Let's generate updates using the symbol naming structure from mockDataGenerator:
      // SECTORS prefixes: TECH, FIN, HLTH, ENRG, IND, CYCL, DEFN, UTIL, MAT, RESE
      // We can generate updates for random symbols in that format.
      // Alternatively, the StockStore can register its current symbols with the WebSocket service, 
      // or we can generate updates using a helper function that takes the current symbols list.
      // Let's allow the WebSocket service to be fed symbols or generate updates for active list.
      // A cleaner way is: the service does not need to know the full dataset, the store calls a method 
      // or the updates are generated for a list of symbols the store passes on subscription, 
      // or the service generates updates for index 1..5050.
      // Let's generate indices 1..5050 and create updates! This is extremely elegant and doesn't couple 
      // the websocket service to the Zustand store directly.
      const SECTOR_PREFIXES = ['TECH', 'FIN', 'HLTH', 'ENRG', 'IND', 'CYCL', 'DEFN', 'UTIL', 'MAT', 'RESE'];
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

      for (let k = 0; k < updateCount; k++) {
        // Pick random stock index between 1 and 5050
        const i = Math.floor(Math.random() * 5050) + 1;
        const prefix = SECTOR_PREFIXES[i % SECTOR_PREFIXES.length];
        
        // Use a simple seeded LCG to get the exact same symbol for index i
        let seed = 0;
        const seedStr = 'stocks_dataset_seed';
        for (let charIdx = 0; charIdx < seedStr.length; charIdx++) {
          seed = Math.imul(31, seed) + seedStr.charCodeAt(charIdx) | 0;
        }
        let s = seed;
        const rand = () => {
          s = Math.imul(48271, s) % 2147483647;
          return (s - 1) / 2147483646;
        };

        // Advance random generator to match index i
        // Since each stock i runs ADJECTIVES/NOUNS calls inside a while loop, we can instead
        // just compute symbol based on index. In mockDataGenerator, we did:
        // while (duplicateCheck) { rand(), rand() } ... 
        // A much easier and 100% reliable approach is for the websocket store to supply 
        // the list of symbols to the websocket service when connecting or updates are processed.
        // Let's implement a register/subscribe model where the stock store registers symbols,
        // or we just query them from the stock store!
        // To avoid circular dependencies, the WebSocket service can just accept a list of symbols,
        // or have a `setSymbols(symbols: string[])` method!
        // Let's implement `setSymbols(symbols: string[])`! This is clean and decouples them nicely.
        if (this.activeSymbols.length === 0) continue;

        const randomIndex = Math.floor(Math.random() * this.activeSymbols.length);
        const symbol = this.activeSymbols[randomIndex];
        
        // Random fluctuation between -1.5% and +1.5%
        const percentChange = (Math.random() - 0.5) * 3.0; // in percent
        
        // We will pass the symbol and the fluctuation to the store, and the store will calculate 
        // the new price based on its existing state. This is perfect!
        updates.push({
          symbol,
          // Store will multiply its current price by (1 + percentChange/100)
          price: percentChange, // We use this as relative price delta percent
          changePercent: percentChange,
          volume: Math.floor(Math.random() * 2500) + 100, // volume delta
          timestamp: Date.now()
        });
      }

      if (updates.length > 0) {
        this.messageCallbacks.forEach((cb) => cb(updates));
      }
    }, 1000);
  }

  private stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private activeSymbols: string[] = [];

  public setSymbols(symbols: string[]) {
    this.activeSymbols = symbols;
  }

  public getStatus() {
    return this.status;
  }
}

// Singleton instance
export const webSocketService = new MockWebSocketService();
