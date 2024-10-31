import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Hash, Clock, Box } from "lucide-react";
import { ChainData } from './chains';

type BlockInfo = {
  id: string;
  name: string;
  blockNumber: number;
  extrinsics: number;
  blockTime: number;
  timestamp: number;
  paraId: number;
};

const MAX_BLOCKS = 20;
const BLOCK_HEIGHT = 64; // Increased height for each block

export function LiveBlockFeed({ chainData, showPolkadot }: { chainData: Record<string, ChainData>, showPolkadot: boolean }) {
  const [displayedBlocks, setDisplayedBlocks] = useState<BlockInfo[]>([]);
  const processedBlocksRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const updateBlocks = useCallback(() => {
    const filteredChains = Object.values(chainData).filter(chain => 
      showPolkadot ? chain.relay === "Polkadot" : chain.relay === "Kusama"
    );

    const newBlocks = filteredChains.flatMap(chain => 
      chain.recentBlocks.slice(0, 1).map(block => ({
        id: `${chain.id}-${block.timestamp}`,
        name: chain.name,
        blockNumber: chain.blockNumber,
        extrinsics: block.extrinsics,
        blockTime: block.blockTime,
        timestamp: block.timestamp,
        paraId: chain.paraId
      }))
    ).filter(block => !processedBlocksRef.current.has(block.id));

    if (newBlocks.length > 0) {
      setDisplayedBlocks(prev => {
        const updatedBlocks = [...newBlocks, ...prev].slice(0, MAX_BLOCKS);
        newBlocks.forEach(block => processedBlocksRef.current.add(block.id));
        return updatedBlocks;
      });
    }
  }, [chainData, showPolkadot]);

  useEffect(() => {
    updateBlocks();
  }, [updateBlocks]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 backdrop-blur-sm overflow-hidden">
      <div ref={containerRef} className="flex items-center h-full pl-6 overflow-x-auto">
        <AnimatePresence initial={false}>
          {displayedBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 mr-2"
              style={{ height: BLOCK_HEIGHT }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`flex flex-col justify-between h-full px-4 py-2 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg animate-pulse' : 'bg-black/30'
                    }`}>
                      <div className="flex items-center">
                        <Hash className={`w-3 h-3 mr-1 ${index === 0 ? 'text-white' : 'text-green-400'}`} />
                        <span className={`text-xs font-medium ${index === 0 ? 'text-white' : 'text-green-400'}`}>{block.name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          <Box className={`w-3 h-3 mr-1 ${index === 0 ? 'text-white' : 'text-cyan-400'}`} />
                          <span className={`text-xs ${index === 0 ? 'text-white' : 'text-cyan-400'}`}>{block.extrinsics}</span>
                        </div>
                        <div className="flex items-center ml-2">
                          <Clock className={`w-3 h-3 mr-1 ${index === 0 ? 'text-white' : 'text-yellow-400'}`} />
                          <span className={`text-xs ${index === 0 ? 'text-white' : 'text-yellow-400'}`}>{block.blockTime?.toFixed(2)}s</span>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Block: {block.blockNumber}</p>
                    <p>Time: {block.blockTime?.toFixed(2)}s</p>
                    <p>Extrinsics: {block.extrinsics}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}