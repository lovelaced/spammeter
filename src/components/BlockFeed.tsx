import React, { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { ChainDataMap } from './types'; // Import necessary types

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
    // Collect all recent blocks from each chain's recentBlocks
    const collectedBlocks = Object.values(chainData).flatMap((chain) =>
      chain.recentBlocks.map((block) => ({
        id: `${chain.relay}-${chain.paraId}-${block.timestamp}`,
        name: chain.name,
        extrinsics: block.extrinsics,
        blockTime: block.blockTime,
        blockNumber: block.blockNumber,
        timestamp: block.timestamp,
        weight: block.weight,
      }))
    );

    setBlocks((prev) => {
      // Combine existing blocks and new collected blocks
      const combinedBlocks = [...prev, ...collectedBlocks];

      // Remove duplicates based on the unique block ID
      const uniqueBlocksMap = new Map<string, Block>();
      combinedBlocks.forEach((block) => {
        uniqueBlocksMap.set(block.id, block);
      });

      // Convert the Map back to an array
      const uniqueBlocks = Array.from(uniqueBlocksMap.values());

      // Sort blocks by timestamp in descending order
      uniqueBlocks.sort((a, b) => b.timestamp - a.timestamp);

      // Filter out blocks older than 1 minute
      const currentTime = Date.now();
      const cutoffTimestamp = currentTime - 60 * 1000; // 1 minute ago
      const prunedBlocks = uniqueBlocks.filter(
        (block) => block.timestamp >= cutoffTimestamp
      );

      // Limit to the 100 most recent blocks
      return prunedBlocks.slice(0, 100);
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
          <span>Transactions</span>
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
              <span className="text-[#9ab1a9] flex items-center">
                {block.extrinsics.toString().padStart(3, '0')}
                {block.extrinsics > 3000 && (
                  <Sparkles className="ml-1 h-4 w-4 text-[#bb9af7]" />
                )}
              </span>
              <span
                className={`flex items-center ${block.blockTime && block.blockTime < 5
                    ? 'font-bold text-white'
                    : 'text-[#9ab1a9]'
                  }`}
              >
                {block.blockTime?.toFixed(2)}s
                {block.blockTime && block.blockTime < 5 && (
                  <Zap className="ml-1 h-4 w-4 text-[#ffff00]" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
