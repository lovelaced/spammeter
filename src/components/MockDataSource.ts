import { DataSource } from './DataSource';
import { DataUpdate } from './types';

export class MockDataSource extends DataSource {
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    this.intervalId = setInterval(() => {
      const mockData = this.generateMockData();
      this.updateState(mockData);
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateMockData(): DataUpdate {
    const relays = ['Polkadot', 'Kusama'];
    const relay = relays[Math.floor(Math.random() * relays.length)];
    const para_id = Math.floor(Math.random() * 2000) + 1;
    
    return {
      relay,
      para_id,
      block_number: Math.floor(Math.random() * 1000000),
      extrinsics_num: Math.floor(Math.random() * 100),
      block_time_seconds: Math.random() * 20,
      timestamp: Date.now()
    };
  }
}