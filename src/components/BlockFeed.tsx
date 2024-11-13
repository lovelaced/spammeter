import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface Block {
  id: string;
  name: string;
  blockNumber: number;
  extrinsics: number;
  blockTime: number;
}

interface BlockFeedProps {
  blocks: Block[];
}

export const BlockFeed: React.FC<BlockFeedProps> = ({ blocks }) => {
  const MAX_DISPLAYED_BLOCKS = 11;

  return (
    <div className="w-full h-full overflow-hidden bg-black font-mono text-xs flex flex-col shadow-[0_0_10px_rgba(59,66,97,0.5)]">
      <div className="bg-black text-[#ffffff] p-1 flex items-center justify-between border-b border-[#07ffff]">
        <span className="font-bold">Realtime Blocks</span>
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
              <span className="text-[#9ab1a9] flex items-center">
                {block.blockTime?.toFixed(2).padStart(5, '0')}s
                {block.blockTime < 5 && (
                  <Zap className="ml-1 h-4 w-4 text-[#ff9e64]" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};