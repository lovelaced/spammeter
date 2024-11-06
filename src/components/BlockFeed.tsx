import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface BlockFeedProps {
  blocks: Array<{ id: string; name: string; extrinsics: number; blockTime: number, blockNumber: number }>;
}

export const BlockFeed: React.FC<BlockFeedProps> = ({ blocks }) => {
  const MAX_DISPLAYED_BLOCKS = 10;

  return (
    <div className="w-full h-full overflow-hidden bg-[#0000ff] font-mono text-xs flex flex-col">
      <div className="bg-[#0000ff] text-white p-1 flex items-center justify-between border-b border-white">
        <span className="font-bold">Realtime Blocks</span>
        <span className="hidden sm:inline">
          F1:Help F2:Menu F3:View F4:Edit F5:Copy F6:RenMov F7:Mkdir F8:Delete
        </span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 gap-2 text-gray-400 border-b border-white p-1">
          <span>Block #</span>
          <span>Chain</span>
          <span>Transactions</span>
          <span>Block Time</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {blocks.slice(0, MAX_DISPLAYED_BLOCKS).map((block) => (
            <div
              key={block.id}
              className="grid grid-cols-4 gap-2 items-center p-1 border-b border-white/20"
            >
              <span className="text-gray-300">{block.blockNumber}</span>
              <span className="text-gray-300">{block.name}</span>
              <span className="text-gray-300 flex items-center">
                {block.extrinsics.toString().padStart(3, '0')}
                {block.extrinsics > 3000 && (
                  <Sparkles className="ml-1 h-4 w-4 text-purple-400" />
                )}
              </span>
              <span className="text-gray-300 flex items-center">
                {block.blockTime?.toFixed(2).padStart(5, '0')}s
                {block.blockTime < 5 && (
                  <Zap className="ml-1 h-4 w-4 text-yellow-400" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};