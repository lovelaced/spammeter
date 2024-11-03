import { DataSource } from './DataSource';
import { DataUpdate } from './types';

export class RealDataSource extends DataSource {
  private eventSource: EventSource | null = null;

  start(): void {
    this.eventSource = new EventSource('https://stream.freeside.network/events');

    this.eventSource.onopen = () => {
      console.log("Connected to event source");
    };

    this.eventSource.addEventListener('consumptionUpdate', (event: MessageEvent) => {
      try {
        const rawData: DataUpdate = JSON.parse(event.data);
        console.log("raw data:", rawData);
        this.updateState(rawData);
      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.stop();
    };
  }

  stop(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
