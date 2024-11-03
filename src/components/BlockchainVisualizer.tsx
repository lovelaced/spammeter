import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Block {
  id: string;
  name: string;
  extrinsics: number;
  blockTime: number;
  blockNumber: number;
  weight: number; // Value between 0 and 1
}

interface VisibleBlock extends Block {
  position: { top: string; left: string };
  ditheredContent: string;
}

interface BlockchainVisualizerProps {
  blocks: Block[];
}

export const BlockchainVisualizer: React.FC<BlockchainVisualizerProps> = ({ blocks }) => {
  const [visibleBlocks, setVisibleBlocks] = useState<VisibleBlock[]>([]);

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
            top: `${Math.random() * 70}%`,
            left: `${Math.random() * 85}%`,
          },
          ditheredContent: existingBlock?.ditheredContent || generateDitheredContent(block),
        };
      })
      .filter((block): block is VisibleBlock => block !== null);

    setVisibleBlocks(prev => {
      const blockMap = new Map<string, VisibleBlock>();

      // Add new blocks first
      for (const block of newVisibleBlocks) {
        if (
          !blockMap.has(block.id) ||
          block.blockNumber > (blockMap.get(block.id)?.blockNumber || 0)
        ) {
          blockMap.set(block.id, block);
        }
      }

      // Add previous blocks if they are newer
      for (const block of prev) {
        if (
          !blockMap.has(block.id) ||
          block.blockNumber > (blockMap.get(block.id)?.blockNumber || 0)
        ) {
          blockMap.set(block.id, block);
        }
      }

      return Array.from(blockMap.values()).slice(0, 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const generateDitheredContent = (block: Block) => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 82;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 160, 82);

      // Draw dithered extrinsics representation
      ctx.fillStyle = 'black';
      const weight = Math.min(1, Math.max(0, block.weight || 0)); // Ensure weight is between 0 and 1
      const weightHeight = Math.round(weight * 82);
      for (let y = 82 - weightHeight; y < 82; y += 2) {
        for (let x = 0; x < 160; x += 2) {
          if (Math.random() < 0.5) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    return canvas.toDataURL();
  };

  const BlockContent = ({ block }: { block: VisibleBlock }) => {
    const weight = Math.min(1, Math.max(0, block.weight || 0));
    const percentFull = Math.round(weight * 100);
    return (
      <div
        className="w-[160px] h-[100px] bg-white border-2 border-black overflow-hidden"
        style={{ boxShadow: '4px 4px 0 0 rgba(0,0,0,1)' }}
      >
        <div className="bg-black text-white p-1 text-xs flex items-center justify-between">
          <span className="truncate">{percentFull}% Full</span>
          <X size={12} />
        </div>
        <img
          src={block.ditheredContent}
          alt={`Block ${block.id}`}
          className="w-full h-[82px] object-cover"
        />
      </div>
    );
  };

  return (
    <div className="w-full h-64 relative overflow-hidden border-4 border-black bg-white">
      <AnimatePresence>
        {visibleBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            className="absolute"
            style={{
              ...block.position,
              zIndex: visibleBlocks.length - index,
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
};
