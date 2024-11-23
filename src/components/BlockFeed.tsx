import React, { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { ChainDataMap } from './types'; // Import necessary types
import { kusamaChainsConfig } from './chains'; // adjust the import path


interface Block {
  id: string;
  name: string;
  blockNumber: number;
  extrinsics: number;
  blockTime?: number;
  timestamp: number;
  weight: number;
}

interface BlockFeedProps {
  chainData: ChainDataMap;
}

export const BlockFeed: React.FC<BlockFeedProps> = ({ chainData }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const collectedBlocks = Object.values(chainData).flatMap((chain) => {
      const chainConfig = Object.values(kusamaChainsConfig).find(
        (config) => config.paraId === chain.paraId
      );

      return chain.recentBlocks.map((block) => ({
        id: `${chain.relay}-${chain.paraId}-${block.timestamp}`,
        name: chainConfig?.displayName || chain.name, // use displayName if available
        extrinsics: block.extrinsics,
        blockTime: block.blockTime,
        blockNumber: block.blockNumber,
        timestamp: block.timestamp,
        weight: block.weight,
      }));
    });

    setBlocks((prev) => {
      // create a set for existing block ids for fast lookup
      const seenIds = new Set(prev.map((block) => block.id));
      const currentTime = Date.now();
      const cutoffTimestamp = currentTime - 60 * 1000;

      // add only new blocks and filter old blocks simultaneously
      const filteredNewBlocks = collectedBlocks.filter(
        (block) => block.timestamp >= cutoffTimestamp && !seenIds.has(block.id)
      );

      if (filteredNewBlocks.length === 0) {
        // no new blocks or valid updates
        return prev;
      }

      // combine old and new blocks, sort, and limit
      const combinedBlocks = [...prev, ...filteredNewBlocks];
      combinedBlocks.sort((a, b) => b.timestamp - a.timestamp);
      return combinedBlocks.slice(0, 100);
    });
  }, [chainData]);


  const MAX_DISPLAYED_BLOCKS = 11;

  return (
    <div className="w-full h-full overflow-hidden bg-black font-mono text-xs flex flex-col shadow-[0_0_10px_rgba(59,66,97,0.5)]">
      <div className="bg-black text-[#ffffff] p-1 flex items-center justify-between border-b border-[#07ffff]">
        <span className="font-bold">Finalized Blocks</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 gap-2 text-[#07ffff] border-b border-[#07ffff] p-1">
          <span>Block #</span>
          <span>Chain</span>
          <span>
            <span className="hidden sm:inline">Transactions</span>
            <span className="inline sm:hidden">Txns</span>
          </span>
          <span>Blocktime</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {blocks.slice(0, MAX_DISPLAYED_BLOCKS).map((block) => (
            <div
              key={block.id}
              className="grid grid-cols-4 gap-2 items-center p-1 border-b border-[#9ab1a9]/20 hover:bg-[#16161e] transition-colors duration-150"
            >
              <span className="text-[#9ab1a9]">{block.blockNumber}</span>
              <span className="text-[#9ab1a9]">{block.name}</span>
              <span
                className={`flex items-center ${block.extrinsics > 3000
                  ? 'font-bold text-white'
                  : 'text-[#9ab1a9]'
                  }`}
              >
                {block.extrinsics.toString().padStart(3, '0')}
                {block.extrinsics > 3000 && (
                  <Sparkles className="ml-1 h-4 w-4 text-[#bb9af7]" />
                )}
              </span>
              <span
                className={`flex items-center ${block.blockTime !== undefined && block.blockTime < 5
                  ? 'font-bold text-white'
                  : 'text-[#9ab1a9]'
                  }`}
              >
                {block.blockTime !== undefined && block.blockTime > 0
                  ? `${block.blockTime.toFixed(2)}s`
                  : '--'}
                {block.blockTime !== undefined && block.blockTime < 5 && (
                  <Zap className="ml-1 h-4 w-4 text-[#f2ff0d]" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};