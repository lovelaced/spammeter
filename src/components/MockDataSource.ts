import { DataSource } from './DataSource';
import { DataUpdate } from './types';

export class MockDataSource extends DataSource {
  private intervalId: NodeJS.Timeout | null = null;

  private surgeState: 'normal' | 'rampingUp' | 'high' | 'rampingDown' = 'normal';
  private surgeStartTime: number = Date.now();
  private nextSurgeStartTime: number = Date.now(); // Start the first surge on load

  private normalTPS: number = 100;    // Normal total TPS
  private highTPS: number = 70000;    // Max TPS during surge
  private currentTPS: number = this.normalTPS;

  private baseRampUpDuration: number = 15 * 1000;   // Total ramp-up duration (15 seconds)
  private rampDownDuration: number = 5 * 1000;      // Ramp-down duration (5 seconds)

  private paraIds: number[] = Array.from({ length: 100 }, (_, i) => i + 1); // para_ids from 1 to 100

  // Map to store block times for each para_id
  private paraBlockTimes: Map<number, { initial: number; current: number }> = new Map();

  private getRandomTimeBetweenSurges(): number {
    // Random time between surges: 10 to 20 seconds
    return (10 * 1000) + Math.random() * (10 * 1000);
  }

  start(): void {
    this.intervalId = setInterval(() => {
      const mockDataList = this.generateMockData();
      mockDataList.forEach((mockData) => {
        this.updateState(mockData);
      });
    }, 1000); // Generate data every second
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateMockData(): DataUpdate[] {
    const currentTime = Date.now();

    // Handle surge state transitions
    if (this.surgeState === 'normal' && currentTime >= this.nextSurgeStartTime) {
      // Start ramping up
      this.surgeState = 'rampingUp';
      this.surgeStartTime = currentTime;
      console.log('Starting ramp-up');
    }

    if (this.surgeState === 'rampingUp') {
      const elapsed = currentTime - this.surgeStartTime;
      if (elapsed >= this.baseRampUpDuration) {
        // Ramp-up complete, enter high TPS state
        this.surgeState = 'high';
        console.log('Entered high TPS state');
      } else {
        // Calculate TPS factor based on ramp-up progress
        const progress = elapsed / this.baseRampUpDuration;
        this.currentTPS = this.normalTPS + progress * (this.highTPS - this.normalTPS);
        console.log(`Ramping up TPS: ${Math.round(this.currentTPS)} TPS`);
      }
    }

    if (this.surgeState === 'high') {
      const elapsed = currentTime - this.surgeStartTime;
      if (elapsed >= this.baseRampUpDuration + this.surgeDuration()) {
        // High TPS state complete, start ramping down
        this.surgeState = 'rampingDown';
        this.surgeStartTime = currentTime;
        console.log('Starting ramp-down');
      } else {
        this.currentTPS = this.highTPS;
      }
    }

    if (this.surgeState === 'rampingDown') {
      const elapsed = currentTime - this.surgeStartTime;
      if (elapsed >= this.rampDownDuration) {
        // Ramp-down complete, return to normal
        this.surgeState = 'normal';
        this.currentTPS = this.normalTPS;
        this.nextSurgeStartTime = currentTime + this.getRandomTimeBetweenSurges();
        console.log('Returned to normal TPS');
      } else {
        // Calculate TPS factor based on ramp-down progress with exponential easing
        const progress = elapsed / this.rampDownDuration;
        const exponent = 2; // Faster ramp-down
        const easedProgress = 1 - Math.pow(1 - progress, exponent);
        this.currentTPS = this.highTPS - easedProgress * (this.highTPS - this.normalTPS);
        console.log(`Ramping down TPS: ${Math.round(this.currentTPS)} TPS (Progress: ${(progress * 100).toFixed(1)}%)`);
      }
    }

    // Generate mock data for each para_id
    const mockDataList: DataUpdate[] = [];
    const relay = 'Kusama'; // Limit to Kusama
    const currentTPS = this.currentTPS;

    // Distribute TPS among para_ids
    const paraTpsMap = this.distributeTpsAmongParaIds(currentTPS);

    for (const para_id of this.paraIds) {
      const paraTPS = paraTpsMap.get(para_id) || 0;

      // Get or assign block time for this para_id
      let blockTimeInfo = this.paraBlockTimes.get(para_id);

      if (!blockTimeInfo) {
        // Assign initial block time between 6 and 12 seconds
        const initialBlockTime = 6 + Math.random() * 6; // Random between 6 and 12
        blockTimeInfo = { initial: initialBlockTime, current: initialBlockTime };
        this.paraBlockTimes.set(para_id, blockTimeInfo);
      }

      let block_time_seconds = blockTimeInfo.current;

      // Adjust block time based on TPS thresholds
      if (paraTPS > 3000) {
        block_time_seconds = 2;
      } else if (paraTPS > 2000) {
        block_time_seconds = 3;
      } else if (paraTPS > 1000) {
        block_time_seconds = 6;
      } else {
        // Revert to initial block time
        block_time_seconds = blockTimeInfo.initial;
      }

      // Update current block time
      if (blockTimeInfo.current !== block_time_seconds) {
        console.log(`Block time for para_id ${para_id} changed from ${blockTimeInfo.current.toFixed(2)}s to ${block_time_seconds.toFixed(2)}s due to TPS ${Math.round(paraTPS)}`);
        blockTimeInfo.current = block_time_seconds;
      }

      // Calculate extrinsics_num based on paraTPS and block time
      const extrinsics_num = Math.round(paraTPS * block_time_seconds);

      const mockData: DataUpdate = {
        relay,
        para_id,
        block_number: Math.floor(Math.random() * 1000000),
        extrinsics_num,
        block_time_seconds: block_time_seconds,
        timestamp: currentTime,
        total_proof_size: Math.random(),
      };

      mockDataList.push(mockData);
    }

    return mockDataList;
  }

  private distributeTpsAmongParaIds(totalTPS: number): Map<number, number> {
    const paraTpsMap = new Map<number, number>();

    // Assign TPS to each para_id, ensuring no para_id exceeds 3,200 TPS
    let remainingTPS = totalTPS;
    const paraIdsShuffled = [...this.paraIds];
    this.shuffleArray(paraIdsShuffled);

    for (const para_id of paraIdsShuffled) {
      if (remainingTPS <= 0) {
        paraTpsMap.set(para_id, 0);
        continue;
      }

      // Randomly decide the TPS for this para_id, up to 3,200 TPS
      const maxParaTPS = Math.min(3200, remainingTPS);
      const paraTPS = Math.random() * maxParaTPS;

      paraTpsMap.set(para_id, paraTPS);
      remainingTPS -= paraTPS;
    }

    // If there's any remaining TPS due to rounding errors, distribute it
    if (remainingTPS > 0) {
      for (const para_id of paraIdsShuffled) {
        if (remainingTPS <= 0) break;
        const currentParaTPS = paraTpsMap.get(para_id) || 0;
        const additionalTPS = Math.min(3200 - currentParaTPS, remainingTPS);
        paraTpsMap.set(para_id, currentParaTPS + additionalTPS);
        remainingTPS -= additionalTPS;
      }
    }

    // Log total TPS assigned and top para_ids
    const totalAssignedTPS = Array.from(paraTpsMap.values()).reduce((sum, tps) => sum + tps, 0);
    console.log(`Total TPS assigned: ${Math.round(totalAssignedTPS)} TPS`);

    const topParaIds = Array.from(paraTpsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    console.log('Top para_ids TPS:', topParaIds.map(([para_id, tps]) => `para_id ${para_id}: ${Math.round(tps)} TPS`).join(', '));

    return paraTpsMap;
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private surgeDuration(): number {
    return 20 * 1000; // Surge lasts for 20 seconds
  }
}