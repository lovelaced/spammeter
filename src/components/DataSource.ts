import { DataUpdate, DataSourceState, ChainData, ChainDataMap } from './types';
import { polkadotParaIdToChainName, kusamaParaIdToChainName } from './chains';

export abstract class DataSource {
  private listeners: Array<(state: DataSourceState) => void> = [];

  protected state: DataSourceState = {
    chainData: {},
    totalTps: 0,
  };

  abstract start(): void;
  abstract stop(): void;

  // method to register listeners
  addListener(listener: (state: DataSourceState) => void) {
    this.listeners.push(listener);
  }

  // method to notify listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  protected updateState(update: DataUpdate): void {
    const chainId = `${update.relay}-${update.para_id}`;
    const existingChain = this.state.chainData[chainId];
    const nameMapping = update.relay === "Polkadot" ? polkadotParaIdToChainName : kusamaParaIdToChainName;
    const displayName = nameMapping[update.para_id] || `${update.relay}-${update.para_id}`;

    if (update.relay !== "Kusama") return;


    const isValidBlockTime = update.block_time_seconds && update.block_time_seconds > 0;
    const tps = isValidBlockTime ? update.extrinsics_num / update.block_time_seconds : 0;

    const updatedChain: ChainData = existingChain
      ? {
          ...existingChain,
          blockNumber: update.block_number,
          extrinsics: update.extrinsics_num,
          accumulatedExtrinsics: existingChain.accumulatedExtrinsics + update.extrinsics_num,
          blockTime: update.block_time_seconds,
          timestamp: update.timestamp,
          weight: update.total_proof_size,
          tps,
        }
      : {
          id: chainId,
          name: displayName,
          paraId: update.para_id,
          relay: update.relay,
          blockNumber: update.block_number,
          extrinsics: update.extrinsics_num,
          accumulatedExtrinsics: update.extrinsics_num,
          blockTime: update.block_time_seconds,
          timestamp: update.timestamp,
          weight: update.total_proof_size,
          tps,
        };

    const updatedChainData: ChainDataMap = {
      ...this.state.chainData,
      [chainId]: updatedChain,
    };

    const totalTps = Object.values(updatedChainData).reduce(
      (sum, chain) => (chain.blockTime && chain.blockTime > 0 ? sum + chain.tps : sum),
      0
    );

    this.state = { chainData: updatedChainData, totalTps };

    // notify listeners of the state change
    this.notifyListeners();
  }

  getState(): DataSourceState {
    return this.state;
  }
}
