import { DataUpdate, DataSourceState, ChainData, ChainDataMap } from './types';
import { polkadotParaIdToChainName, kusamaParaIdToChainName, westendParaIdToChainName } from './chains';

export abstract class DataSource {
  private listeners: Array<(state: DataSourceState) => void> = [];

  protected state: DataSourceState = {
    chainData: {},
    totalTps: 0,
    totalTpsEma: 0,
    confidenceMetric: 0,
    dataPoints: 0,
  };

  private readonly TARGET_WINDOW_SIZE = 30000; // 30 seconds in milliseconds
  private readonly ALPHA = 0.3; // EMA smoothing factor
  private readonly MIN_DATA_POINTS = 100; // Minimum number of data points for high confidence

  abstract start(): void;
  abstract stop(): void;

  addListener(listener: (state: DataSourceState) => void) {
    this.listeners.push(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  protected updateState(update: DataUpdate): void {
    const chainId = `${update.relay}-${update.para_id}`;
    const existingChain = this.state.chainData[chainId];

    let nameMapping;
    if (update.relay === "Polkadot") {
        return; // ignore polkadot data
        nameMapping = polkadotParaIdToChainName;
    } else if (update.relay === "Kusama") {
        nameMapping = kusamaParaIdToChainName;
    } else if (update.relay === "Westend") {
        nameMapping = westendParaIdToChainName;
    } else {
        nameMapping = {}; // fallback to empty mapping if unknown
    }

    const displayName = nameMapping[update.para_id] || `${update.relay}-${update.para_id}`;
    const blockTime = update.block_time_seconds ?? 0;

    const totalRefTime = (update.ref_time?.normal || 0) +
                         (update.ref_time?.operational || 0) +
                         (update.ref_time?.mandatory || 0);

    const totalProofSize = (update.proof_size?.normal || 0) +
                           (update.proof_size?.operational || 0) +
                           (update.proof_size?.mandatory || 0);

    const updatedRecentBlocks = [
        ...(existingChain?.recentBlocks || []),
        {
            chainId: chainId,
            extrinsics: Math.max(0, update.extrinsics_num - 2), // Ensure extrinsics is at least 0
            timestamp: update.timestamp,
            blockTime: update.block_time_seconds ?? 0,
            blockNumber: update.block_number,
            weight: totalRefTime + totalProofSize,  // Use the calculated ref_time sum
            proofSize: totalProofSize, // Include proof_size sum
        },
    ];

    // Calculate instantaneous TPS (last block only)
    const instantTps = Math.max(0, update.extrinsics_num - 2) / (blockTime || 1); // Avoid division by zero

    // Optionally, prune old blocks to manage memory
    const currentTime = Date.now();
    const cutoffTime = currentTime - this.TARGET_WINDOW_SIZE * 2; // 60 seconds ago
    const prunedRecentBlocks = updatedRecentBlocks.filter(
        (block) => block.timestamp >= cutoffTime
    );

    const { tps: chainTps } = this.calculateTps(updatedRecentBlocks);
    const chainTpsEma = this.calculateEma(existingChain?.tpsEma || chainTps, chainTps);

    const updatedChain: ChainData = {
        ...(existingChain || {}),
        id: chainId,
        name: displayName,
        paraId: update.para_id,
        relay: update.relay,
        blockNumber: update.block_number,
        extrinsics: update.extrinsics_num,
        accumulatedExtrinsics: (existingChain?.accumulatedExtrinsics || 0) + update.extrinsics_num,
        blockTime: blockTime,
        timestamp: update.timestamp,
        weight: totalRefTime + totalProofSize, // Update weight to reflect the summed ref_time and proof_size
        tps: chainTps,
        tpsEma: chainTpsEma,
        instantTps, // Add instantaneous TPS here
        recentBlocks: prunedRecentBlocks,
    };

    const updatedChainData: ChainDataMap = {
        ...this.state.chainData,
        [chainId]: updatedChain,
    };

    const { tps: totalTps, timeWindow: globalTimeWindow } = this.calculateTotalTps(updatedChainData);
    const totalTpsEma = this.calculateEma(this.state.totalTpsEma || totalTps, totalTps);
    const dataPoints = this.state.dataPoints + 1;
    const confidenceMetric = this.calculateConfidenceMetric(globalTimeWindow, dataPoints);

    this.state = { 
        chainData: updatedChainData, 
        totalTps, 
        totalTpsEma, 
        confidenceMetric,
        dataPoints,
    };

    this.notifyListeners();
}


  private calculateTps(blocks: Array<{ extrinsics: number; timestamp: number; blockTime?: number }>): { tps: number, timeWindow: number } {
    if (blocks.length < 2) return { tps: 0, timeWindow: 0 };

    blocks.sort((a, b) => a.timestamp - b.timestamp);
    const timeWindow = Math.min(blocks[blocks.length - 1].timestamp - blocks[0].timestamp, this.TARGET_WINDOW_SIZE);
    const relevantBlocks = blocks.filter(block => block.timestamp >= blocks[blocks.length - 1].timestamp - timeWindow);

    const totalExtrinsics = relevantBlocks.reduce((sum, block) => sum + block.extrinsics, 0);
    const tps = (totalExtrinsics * 1000) / timeWindow;

    return { tps, timeWindow };
  }

  private calculateTotalTps(chainData: ChainDataMap): { tps: number, timeWindow: number } {
    const allBlocks = Object.values(chainData).flatMap(chain => chain.recentBlocks);
    return this.calculateTps(allBlocks);
  }

  private calculateEma(oldValue: number, newValue: number): number {
    return this.ALPHA * newValue + (1 - this.ALPHA) * oldValue;
  }

  private calculateConfidenceMetric(timeWindow: number, dataPoints: number): number {
    const timeConfidence = Math.min(timeWindow / this.TARGET_WINDOW_SIZE, 1);
    const dataPointConfidence = Math.min(dataPoints / this.MIN_DATA_POINTS, 1);
    return (timeConfidence + dataPointConfidence) / 2;
  }

  getState(): DataSourceState {
    return this.state;
  }

  protected getChainData(chainId: string): ChainData | undefined {
    return this.state.chainData[chainId];
  }

  protected getAllChainData(): ChainDataMap {
    return this.state.chainData;
  }

  getTotalTps(): number {
    return this.state.totalTps;
  }

  getTotalTpsEma(): number {
    return this.state.totalTpsEma;
  }

  getConfidenceMetric(): number {
    return this.state.confidenceMetric;
  }

  isHighConfidence(): boolean {
    return this.state.confidenceMetric >= 0.95;
  }
}