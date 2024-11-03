export interface ChainData {
    id: string;
    name: string;
    paraId: number;
    relay: string;
    blockNumber: number;
    extrinsics: number;
    accumulatedExtrinsics: number;
    blockTime: number;
    timestamp: number;
    weight: number;
    tps: number;
  }
  
  export interface ChainDataMap {
    [chainId: string]: ChainData;
  }
  
  export interface DataUpdate {
    relay: string;
    para_id: number;
    block_number: number;
    extrinsics_num: number;
    block_time_seconds: number;
    timestamp: number;
    total_proof_size: number;
  }
  
  export interface DataSourceState {
    chainData: ChainDataMap;
    totalTps: number;
  }