// Leaderboard.tsx

import React from 'react';
import { ChainData } from './types'; // Adjust the import path to your ChainData type

interface LeaderboardProps {
  chainData: Record<string, ChainData>;
  chainMaxTps: { [key: string]: number };
  renderChainName: (chain: ChainData) => JSX.Element;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ chainData, chainMaxTps, renderChainName }) => {
  const leaderboard = Object.values(chainData)
    .filter((chain) => !isNaN(chain.tps) && isFinite(chain.tps))
    .sort((a, b) => b.tps - a.tps)
    .slice(0, 10);

  return (
    <div className="w-full h-full space-y-1 bg-white p-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-bold border-b-2 border-black pb-1 mb-2">
        <span className="col-span-1">#</span>
        <span className="col-span-3">Chain</span>
        <span className="col-span-2">TPS</span>
        <span className="col-span-2">Max TPS</span>
        <span className="col-span-4">
          <span className="hidden sm:inline">Total Transactions</span>
          <span className="inline sm:hidden">Total Txns</span>
        </span>
      </div>
      {/* Data Rows */}
      {leaderboard.map((data, index) => (
        <div
          key={data.name}
          className="grid grid-cols-12 gap-2 items-center text-xs border-b border-dotted border-primary-foreground/20 pb-1"
        >
          <span className="col-span-1">{index + 1}.</span>
          <span className="col-span-3 flex items-center gap-1">
            {renderChainName(data)}
          </span>
          <span className="col-span-2 font-bold">
            {data.tps === 0 || !isFinite(data.tps) || isNaN(data.tps) ? '--' : data.tps.toFixed(2)}
          </span>
          <span className="col-span-2 font-bold">
            {chainMaxTps[data.name]?.toFixed(2) || '--'}
          </span>
          <span className="col-span-4">
            {data.accumulatedExtrinsics.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
