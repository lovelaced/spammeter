import { DataSource } from './DataSource';
import { DataUpdate } from './types';

interface ParaState {
  paraId: number;
  blockNumber: number;
  blockTimeSeconds: number;
  initialBlockTime: number;
  assignedTPS: number;
  nextBlockTime: number;
  timer: NodeJS.Timeout | null;
}

export class MockDataSource extends DataSource {
  private totalParachains: number = 100;
  private surgeState: 'normal' | 'rampingUp' | 'high' | 'rampingDown' = 'normal';
  private normalTPS: number = 100;    // Normal total TPS
  private highTPS: number = 70000;    // Max TPS during surge
  private currentTPS: number = this.normalTPS;
  private surgeStartTime: number = Date.now();
  private nextSurgeStartTime: number = Date.now(); // Start the first surge on load
  private baseRampUpDuration: number = 15 * 1000;   // Total ramp-up duration (15 seconds)
  private rampDownDuration: number = 5 * 1000;      // Ramp-down duration (5 seconds)

  private paraStates: Map<number, ParaState> = new Map();

  private surgeInterval: NodeJS.Timeout | null = null;

  start(): void {
    // Initialize paraStates
    for (let i = 1; i <= this.totalParachains; i++) {
      const initialBlockTime = this.getRandomInitialBlockTime();
      const paraState: ParaState = {
        paraId: i,
        blockNumber: 0,
        blockTimeSeconds: initialBlockTime,
        initialBlockTime: initialBlockTime,
        assignedTPS: 1, // Start with minimal TPS
        nextBlockTime: Date.now() + initialBlockTime * 1000,
        timer: null,
      };
      this.paraStates.set(i, paraState);
      this.scheduleNextBlock(paraState);
    }

    // Start surge management
    this.surgeInterval = setInterval(() => {
      this.manageSurge();
    }, 500); // Check surge state every 500ms
  }

  stop(): void {
    // Clear all timers
    for (const paraState of this.paraStates.values()) {
      if (paraState.timer) {
        clearTimeout(paraState.timer);
        paraState.timer = null;
      }
    }

    if (this.surgeInterval) {
      clearInterval(this.surgeInterval);
      this.surgeInterval = null;
    }
  }

  private getRandomInitialBlockTime(): number {
    // Random initial block time between 6s and 18s
    return 6 + Math.random() * 7; // Random value between 6 and 18
  }

  private scheduleNextBlock(paraState: ParaState): void {
    const delay = paraState.blockTimeSeconds * 1000;
    paraState.nextBlockTime = Date.now() + delay;

    paraState.timer = setTimeout(() => {
      this.generateBlock(paraState);
    }, delay);
  }

  private generateBlock(paraState: ParaState): void {
    // Calculate extrinsics_num based on assignedTPS and block time
    const extrinsics_num = Math.round(paraState.assignedTPS * paraState.blockTimeSeconds);

    const mockData: DataUpdate = {
      relay: 'Kusama',
      para_id: paraState.paraId,
      block_number: paraState.blockNumber++,
      extrinsics_num,
      block_time_seconds: paraState.blockTimeSeconds,
      timestamp: paraState.nextBlockTime,
      total_proof_size: Math.random(),
      ref_time: {
        normal: Math.random(),
        operational: Math.random(),
        mandatory: Math.random(),
      },
      proof_size: {
        normal: Math.random(),
        operational: Math.random(),
        mandatory: Math.random(),
      },
    };

    // Update state
    this.updateState(mockData);

    // Schedule next block
    this.scheduleNextBlock(paraState);
  }

  private manageSurge(): void {
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
        this.currentTPS = this.highTPS;
        console.log('Entered high TPS state');
        this.distributeTPS();
      } else {
        // Calculate TPS factor based on ramp-up progress
        const progress = elapsed / this.baseRampUpDuration;
        this.currentTPS = this.normalTPS + progress * (this.highTPS - this.normalTPS);
        console.log(`Ramping up TPS: ${Math.round(this.currentTPS)} TPS`);
        this.distributeTPS();
      }
    }

    if (this.surgeState === 'high') {
      const elapsed = currentTime - this.surgeStartTime;
      if (elapsed >= this.baseRampUpDuration + this.surgeDuration()) {
        // High TPS state complete, start ramping down
        this.surgeState = 'rampingDown';
        this.surgeStartTime = currentTime;
        console.log('Starting ramp-down');
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
        this.distributeTPS();
      } else {
        // Calculate TPS factor based on ramp-down progress
        const progress = elapsed / this.rampDownDuration;
        this.currentTPS = this.highTPS - progress * (this.highTPS - this.normalTPS);
        console.log(`Ramping down TPS: ${Math.round(this.currentTPS)} TPS`);
        this.distributeTPS();
      }
    }
  }

  private distributeTPS(): void {
    const totalTPS = this.currentTPS;

    const surgePercentage = 0.5; // 50% of parachains will surge
    const numSurgingParaIds = Math.floor(this.totalParachains * surgePercentage);

    // Shuffle paraIds to randomly select surging parachains
    const shuffledParaIds = [...this.paraStates.keys()];
    this.shuffleArray(shuffledParaIds);

    const surgingParaIds = shuffledParaIds.slice(0, numSurgingParaIds);
    const normalParaIds = shuffledParaIds.slice(numSurgingParaIds);

    const normalTPSPerPara = 1; // Normal TPS per non-surging parachain

    // Calculate total normal TPS
    const totalNormalTPS = normalTPSPerPara * normalParaIds.length;

    // Ensure totalNormalTPS does not exceed totalTPS
    const maxSurgeTPS = Math.max(0, totalTPS - totalNormalTPS);

    // Generate random weights for surging parachains
    const weights: number[] = [];
    let totalWeight = 0;

    for (let i = 0; i < surgingParaIds.length; i++) {
      const weight = Math.random(); // Random weight between 0 and 1
      weights.push(weight);
      totalWeight += weight;
    }

    // Assign TPS to surging parachains based on weights
    let totalAssignedSurgeTPS = 0;

    const paraTPSAssignments: Map<number, number> = new Map();

    for (let i = 0; i < surgingParaIds.length; i++) {
      const para_id = surgingParaIds[i];
      const weight = weights[i];
      let paraTPS = (weight / totalWeight) * maxSurgeTPS;

      // Ensure paraTPS does not exceed 3,200 TPS
      paraTPS = Math.min(paraTPS, 3200);

      paraTPSAssignments.set(para_id, paraTPS);
      totalAssignedSurgeTPS += paraTPS;
    }

    // Adjust for any remaining surge TPS due to capping at 3,200 TPS
    let remainingSurgeTPS = maxSurgeTPS - totalAssignedSurgeTPS;

    if (remainingSurgeTPS > 0) {
      // Distribute remaining TPS to parachains that haven't reached the cap
      for (const [para_id, currentParaTPS] of paraTPSAssignments) {
        if (remainingSurgeTPS <= 0) break;
        if (currentParaTPS < 3200) {
          const additionalTPS = Math.min(3200 - currentParaTPS, remainingSurgeTPS);
          const newParaTPS = currentParaTPS + additionalTPS;
          paraTPSAssignments.set(para_id, newParaTPS);
          totalAssignedSurgeTPS += additionalTPS;
          remainingSurgeTPS -= additionalTPS;
        }
      }
    }

    // Update assigned TPS and block times for surging parachains
    for (const [para_id, tps] of paraTPSAssignments) {
      const paraState = this.paraStates.get(para_id)!;
      paraState.assignedTPS = tps;

      // Adjust block times based on TPS thresholds
      const previousBlockTime = paraState.blockTimeSeconds;
      const previousNextBlockTime = paraState.nextBlockTime;

      if (tps > 3000) {
        paraState.blockTimeSeconds = 2;
      } else if (tps > 2000) {
        paraState.blockTimeSeconds = 3;
      } else if (tps > 1000) {
        paraState.blockTimeSeconds = 6;
      } else {
        paraState.blockTimeSeconds = paraState.initialBlockTime;
      }

      // If block time changed, adjust the timer accordingly
      if (paraState.blockTimeSeconds !== previousBlockTime) {
        if (paraState.timer) {
          clearTimeout(paraState.timer);
        }

        const timeRemaining = Math.max(0, previousNextBlockTime - Date.now());
        const adjustedTimeRemaining = (paraState.blockTimeSeconds / previousBlockTime) * timeRemaining;

        paraState.nextBlockTime = Date.now() + adjustedTimeRemaining;

        paraState.timer = setTimeout(() => {
          this.generateBlock(paraState);
        }, adjustedTimeRemaining);
      }
    }

    // Update assigned TPS and block times for non-surging parachains
    for (const para_id of normalParaIds) {
      const paraState = this.paraStates.get(para_id)!;
      paraState.assignedTPS = normalTPSPerPara;
      const previousBlockTime = paraState.blockTimeSeconds;
      paraState.blockTimeSeconds = paraState.initialBlockTime;

      // If block time changed, adjust the timer accordingly
      if (paraState.blockTimeSeconds !== previousBlockTime) {
        if (paraState.timer) {
          clearTimeout(paraState.timer);
        }

        const timeRemaining = Math.max(0, paraState.nextBlockTime - Date.now());
        const adjustedTimeRemaining = (paraState.blockTimeSeconds / previousBlockTime) * timeRemaining;

        paraState.nextBlockTime = Date.now() + adjustedTimeRemaining;

        paraState.timer = setTimeout(() => {
          this.generateBlock(paraState);
        }, adjustedTimeRemaining);
      }
    }

    // Log total TPS assigned and top para_ids
    const totalAssignedTPS = Array.from(this.paraStates.values()).reduce((sum, state) => sum + state.assignedTPS, 0);
    console.log(`Total TPS assigned: ${Math.round(totalAssignedTPS)} TPS`);

    const topParaIds = Array.from(this.paraStates.values())
      .sort((a, b) => b.assignedTPS - a.assignedTPS)
      .slice(0, 5)
      .map(state => `para_id ${state.paraId}: ${Math.round(state.assignedTPS)} TPS`);

    console.log('Top para_ids TPS:', topParaIds.join(', '));
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private getRandomTimeBetweenSurges(): number {
    // Random time between surges: 10 to 20 seconds
    return (10 * 1000) + Math.random() * (10 * 1000);
  }

  private surgeDuration(): number {
    return 20 * 1000; // Surge lasts for 20 seconds
  }
}
