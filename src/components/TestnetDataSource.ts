import { DataSource } from './DataSource';
import { DataUpdate } from './types';

export class TestnetDataSource extends DataSource {
  private eventSource: EventSource | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private baseReconnectDelay: number = 1000; // 1 second

  start(): void {
    this.connect();
  }

  private connect(): void {
    this.eventSource = new EventSource('https://status.freeside.network/events');

    this.eventSource.onopen = () => {
      console.log("Connected to event source");
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    this.eventSource.addEventListener('consumptionUpdate', (event: MessageEvent) => {
      try {
        const rawData: DataUpdate = JSON.parse(event.data);
        this.updateState(rawData);
      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.handleConnectionError();
    };
  }

  private handleConnectionError(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
      this.reconnectAttempts++;
    } else {
      console.error('Max reconnection attempts reached. Please try again later.');
      // You might want to notify the user or trigger some fallback behavior here
    }
  }

  stop(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }
}