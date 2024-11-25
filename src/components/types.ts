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
  accumulatedRefTime: number; // New field for ref_time sum
  accumulatedProofSize: number; // New field for proof_size sum
  tps: number;
  tpsEma: number;
  instantTps: number; // New field for instantaneous TPS
  recentBlocks: Array<{ extrinsics: number; timestamp: number; blockNumber: number; blockTime: number; weight: number; proofSize: number }>; // Include proofSize
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
    total_proof_size: number; // optional: maintain if this is a precomputed value
    ref_time: {
        normal: number;
        operational: number;
        mandatory: number;
    };
    proof_size: {
        normal: number;
        operational: number;
        mandatory: number;
    };
}

  
  export interface DataSourceState {
    chainData: ChainDataMap;
    totalTps: number;
    totalTpsEma: number;
    confidenceMetric: number;
    dataPoints: number;
  }