import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockFeedProps {
  blocks: Array<{ id: string; name: string; extrinsics: number; blockTime: number }>;
}

export const BlockFeed: React.FC<BlockFeedProps> = ({ blocks }) => {
  const formatBlockId = (id: string) => id.toString().toUpperCase().padStart(8, '0').slice(0, 8);
  const MAX_DISPLAYED_BLOCKS = 10;

  return (
    <div className="w-full h-full overflow-hidden bg-[#0000ff] font-mono text-xs flex flex-col">
      <div className="bg-[#0000ff] text-white p-1 flex items-center justify-between border-b border-white">
        <span className="font-bold">Block Feed</span>
        <span className="hidden sm:inline">
          F1:Help F2:Menu F3:View F4:Edit F5:Copy F6:RenMov F7:Mkdir F8:Delete
        </span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 gap-2 text-gray-400 border-b border-white p-1">
          <span>Block ID</span>
          <span>Chain</span>
          <span>Extrinsics</span>
          <span>Block Time</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence initial={false}>
            {blocks.slice(0, MAX_DISPLAYED_BLOCKS).map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-4 gap-2 items-center p-1 border-b border-white/20 absolute w-full"
                style={{ top: `${index * 24}px` }}
              >
                <span className="text-gray-300">{formatBlockId(block.id)}</span>
                <span className="text-gray-300">{block.name}</span>
                <span className="text-gray-300">{block.extrinsics.toString().padStart(3, '0')}</span>
                <span className="text-gray-300">
                  {block.blockTime?.toFixed(2).padStart(5, '0')}s
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
