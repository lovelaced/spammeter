import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Constants for popup dimensions
const POPUP_WIDTH = 160;
const POPUP_HEIGHT = 100;
const POPUP_CONTENT_HEIGHT = POPUP_HEIGHT - 18; // Subtracting the header height

interface Block {
  id: string;
  name: string;
  extrinsics: number;
  blockTime: number;
  blockNumber: number;
  weight: number; // Value between 0 and 1
  timestamp: number;
}

interface VisibleBlock extends Block {
  position: { top: string; left: string };
  ditheredContent: string;
  zIndex: number;
}

interface BlockchainVisualizerProps {
  blocks: Block[];
}

const generateDitheredContent = (block: Block) => {
  const canvas = document.createElement('canvas');
  canvas.width = POPUP_WIDTH;
  canvas.height = POPUP_CONTENT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, POPUP_WIDTH, POPUP_CONTENT_HEIGHT);

    ctx.fillStyle = 'black';
    const weight = Math.min(1, Math.max(0, block.weight));
    const weightHeight = Math.round(weight * POPUP_CONTENT_HEIGHT);
    for (let y = POPUP_CONTENT_HEIGHT - weightHeight; y < POPUP_CONTENT_HEIGHT; y += 2) {
      for (let x = 0; x < POPUP_WIDTH; x += 2) {
        if (Math.random() < 0.5) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
  return canvas.toDataURL();
};

export function BlockchainVisualizer({ blocks = [] }: BlockchainVisualizerProps) {
  const [visibleBlocks, setVisibleBlocks] = useState<VisibleBlock[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(0);

  useEffect(() => {
    const newVisibleBlocks = blocks
      .map(block => {
        const existingBlock = visibleBlocks.find(vb => vb.id === block.id);
        if (existingBlock && existingBlock.blockNumber >= block.blockNumber) {
          return null;
        }

        return {
          ...block,
          position: {
            top: `${Math.random() * (100 - (POPUP_HEIGHT / 5))}%`,
            left: `${Math.random() * (100 - (POPUP_WIDTH / 10))}%`,
          },
          ditheredContent: existingBlock?.ditheredContent || generateDitheredContent(block),
          zIndex: maxZIndex + 1,
          timestamp: Date.now(),
        };
      })
      .filter((block): block is VisibleBlock => block !== null);

    setVisibleBlocks(prev => {
      const updatedBlocks = [...prev, ...newVisibleBlocks];
      
      updatedBlocks.sort((a, b) => b.timestamp - a.timestamp);
      updatedBlocks.forEach((block, index) => {
        block.zIndex = updatedBlocks.length - index;
      });

      const prunedBlocks = updatedBlocks.slice(0, 100);

      setMaxZIndex(prunedBlocks.length);

      return prunedBlocks;
    });
  }, [blocks, maxZIndex]);

  return (
    <div className="w-full h-64 relative overflow-hidden border-4 border-black bg-white">
      <AnimatePresence>
        {visibleBlocks.map((block) => (
          <motion.div
            key={`${block.id}-${block.blockNumber}`}
            className="absolute"
            style={{
              ...block.position,
              zIndex: block.zIndex,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <BlockContent block={block} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const BlockContent: React.FC<{ block: VisibleBlock }> = ({ block }) => {
  const percentFull = Math.min(Math.round(block.weight * 100), 100);
  
  return (
    <div
      className="bg-white border-2 border-black overflow-hidden"
      style={{
        width: `${POPUP_WIDTH}px`,
        height: `${POPUP_HEIGHT}px`,
        boxShadow: '4px 4px 0 0 rgba(0,0,0,1)'
      }}
    >
      <div className="bg-black text-white p-1 text-xs flex items-center justify-between">
        <span className="truncate">{percentFull}% Full Block</span>
        <X size={12} />
      </div>
      <img
        src={block.ditheredContent}
        alt={`Block ${block.id}`}
        className="w-full object-cover"
        style={{ height: `${POPUP_CONTENT_HEIGHT}px` }}
      />
    </div>
  );
};
export default BlockchainVisualizer;