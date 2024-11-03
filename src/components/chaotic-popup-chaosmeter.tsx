'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, Clock, Hash, Box, X, Trophy, Zap, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDataSource } from './useDataSource'
import { RealDataSource } from './RealDataSource'
import { MockDataSource } from './MockDataSource'
import { ChainConfig, kusamaParaIdToChainName, polkadotParaIdToChainName } from './chains'

const PopupWindow = ({ title, children, onClose, className }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className={`bg-white border-4 border-black overflow-hidden flex flex-col w-full ${className}`}
    style={{ boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}
  >
    <div className="bg-black text-white p-1 flex items-center justify-between w-full">
      <div className="text-sm font-bold flex items-center">
        <span className="inline-block w-3 h-3 bg-white mr-2"></span>
        {title}
      </div>
      <button onClick={onClose} className="text-white hover:text-gray-300">
        <X size={16} />
      </button>
    </div>
    <div className="flex-1 overflow-auto">{children}</div>
  </motion.div>
)

const DitheredBar = ({ value, max }: { value: number; max: number }) => (
  <div className="w-full h-6 bg-white border-2 border-black relative overflow-hidden">
    <div
      className="h-full bg-black"
      style={{
        width: `${(value / max) * 100}%`,
        maskImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1\' height=\'1\' fill=\'black\'/%3E%3Crect x=\'2\' y=\'2\' width=\'1\' height=\'1\' fill=\'black\'/%3E%3C/svg%3E")',
        maskSize: '4px 4px',
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-white">
      {value.toFixed(2)}
    </div>
  </div>
)

const DitheredText = ({ text, style }: { text: string; style: React.CSSProperties }) => (
  <div
    className="absolute text-6xl font-bold"
    style={{
      ...style,
      color: 'black',
      maskImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1\' height=\'1\' fill=\'black\'/%3E%3Crect x=\'2\' y=\'2\' width=\'1\' height=\'1\' fill=\'black\'/%3E%3C/svg%3E")',
      maskSize: '4px 4px',
      zIndex: -1,
    }}
  >
    {text}
  </div>
)

const BlocktimeHeatmap = ({ chainData }: { chainData: Record<string, { blockTime: number }> }) => {
  const getColor = (blockTime: number) => {
    if (blockTime < 3) return '#000000'
    if (blockTime < 6) return '#333333'
    if (blockTime < 12) return '#666666'
    if (blockTime < 18) return '#999999'
    return '#cccccc'
  }

  const sortedChainData = useMemo(() => {
    return Object.entries(chainData)
      .sort(([, a], [, b]) => a.blockTime - b.blockTime)
  }, [chainData])

  return (
    <div className="grid grid-cols-10 gap-1">
          {sortedChainData.map(([name, data], index) => (
  <div key={name}
            className="w-4 h-4 sm:w-6 sm:h-6 relative"
            style={{
              backgroundColor: getColor(data.blockTime),
              maskImage: 'url("data:image/svg+xml,%3Csvg width=\'2\' height=\'2\' viewBox=\'0 0 2 2\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1\' height=\'1\' fill=\'black\'/%3E%3Crect x=\'1\' y=\'1\' width=\'1\' height=\'1\' fill=\'black\'/%3E%3C/svg%3E")',
              maskSize: '2px 2px',
              opacity: 0.9,
            }}
            >
            {data.blockTime < 3 && (
              <div className="absolute inset-0 border-2 border-white animate-pulse" />
            )}
        </div>
      ))}
    </div>
  )
}

const BlockFeed = ({ blocks }: { blocks: Array<{ id: string; name: string; extrinsics: number; blockTime: number }> }) => {
  const formatBlockId = (id: string) => id.toString().toUpperCase().padStart(8, '0').slice(0, 8)
  const MAX_DISPLAYED_BLOCKS = 10

  return (
    <div className="w-full h-full overflow-hidden bg-[#0000ff] font-mono text-xs flex flex-col">
      <div className="bg-[#0000ff] text-white p-1 flex items-center justify-between border-b border-white">
        <span className="font-bold">Block Feed</span>
        <span className="hidden sm:inline">F1:Help F2:Menu F3:View F4:Edit F5:Copy F6:RenMov F7:Mkdir F8:Delete</span>
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
                <span className="text-gray-300">{block.blockTime?.toFixed(2).padStart(5, '0')}s</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const GlitchText = ({ text, tps }: { text: string; tps: number }) => {
  const [glitchedText, setGlitchedText] = useState(text);

  useEffect(() => {
    const glitchChars = '!<>-_\\/[]{}—=+*^?#________';
    const intensity = Math.min(tps / 50000, 1); // Normalize TPS to 0-1 range
    const speed = Math.max(50, 500 - tps / 50); // Adjust speed based on TPS (50ms to 500ms)

    const interval = setInterval(() => {
      setGlitchedText(
        text
          .split('')
          .map((char, index) =>
            Math.random() < intensity ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
          )
          .join('')
      );
    }, speed);

    return () => clearInterval(interval);
  }, [text, tps]);

  return <span className="font-glitch">{glitchedText}</span>;
};

const BlockchainVisualizer = ({ blocks }: { blocks: Array<{ id: string; name: string; extrinsics: number; blockTime: number; blockNumber: number }> }) => {
  const [visibleBlocks, setVisibleBlocks] = useState<Array<{ id: string; name: string; extrinsics: number; blockTime: number; blockNumber: number, position: { top: string; left: string }; ditheredContent: string }>>([]);

  useEffect(() => {
    const newVisibleBlocks = blocks.map(block => {
      // check if the block already exists with the same id and lower blockNumber
      const existingBlock = visibleBlocks.find(vb => vb.id === block.id);
      if (existingBlock && existingBlock.blockNumber >= block.blockNumber) {
        return null; // skip if the existing block is more recent or equal
      }

      // generate a new visible block with a random position and dithered content
      return {
        ...block,
        position: {
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 85}%`,
        },
        ditheredContent: existingBlock?.ditheredContent || generateDitheredContent(block),
      };
    }).filter(Boolean); // remove any null entries

    setVisibleBlocks(prev => {
      // use a Map to ensure unique ids and to easily replace with the latest block by blockNumber
      const blockMap = new Map();
    
      // add new blocks first, allowing them to override older blocks with the same id
      for (const block of newVisibleBlocks) {
        if (block && (!blockMap.has(block.id) || block.blockNumber > blockMap.get(block.id).blockNumber)) {
          blockMap.set(block.id, block);
        }
      }
    
      // add previous blocks, only if they are newer than what's currently in the map
      for (const block of prev) {
        if (block && (!blockMap.has(block.id) || block.blockNumber > blockMap.get(block.id).blockNumber)) {
          blockMap.set(block.id, block);
        }
      }
    
      // convert map values to an array and limit to the most recent 50 blocks
      return Array.from(blockMap.values()).slice(0, 100);
    });
  }, [blocks]);

  const generateDitheredContent = (block: typeof blocks[0]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 82;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 160, 82);

      // draw dithered extrinsics representation
      ctx.fillStyle = 'black';
      const percentFull = Math.min(100, (block.extrinsics / 100) * 100);
      const extrinsicsHeight = Math.round((percentFull / 100) * 82);
      for (let y = 82 - extrinsicsHeight; y < 82; y += 2) {
        for (let x = 0; x < 160; x += 2) {
          if (Math.random() < 0.5) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    return canvas.toDataURL();
  };

  const BlockContent = ({ block }: { block: typeof visibleBlocks[0] }) => {
    const percentFull = Math.min(100, Math.round((block.extrinsics / 100) * 100));
    return (
      <div className="w-[160px] h-[100px] bg-white border-2 border-black overflow-hidden" style={{ boxShadow: '4px 4px 0 0 rgba(0,0,0,1)' }}>
        <div className="bg-black text-white p-1 text-xs flex items-center justify-between">
          <span className="truncate">{percentFull}% Full</span>
          <X size={12} />
        </div>
        <img src={block.ditheredContent} alt={`Block ${block.id}`} className="w-full h-[82px] object-cover" />
      </div>
    )
  }

  return (
    <div className="w-full h-64 relative overflow-hidden border-4 border-black bg-white">
      <AnimatePresence>
        {visibleBlocks.map((block, index) => (
          <motion.div key={block.id}
            className="absolute"
            style={{
              ...block.position,
              zIndex: visibleBlocks.length - index
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <BlockContent block={block} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const HighTPSPopup = ({ chainData }: { chainData: Record<string, { tps: number, blockTime: number }> }) => {
  const highTPSChains = Object.entries(chainData)
    .filter(([, data]) => data.tps > 1000)
    .sort(([, a], [, b]) => b.tps - a.tps)

  return (
    <div className="w-full h-full overflow-auto p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {highTPSChains.map(([name, data], index) => (
  <div key={name} className="bg-white border-2 border-black p-2 flex flex-col items-center justify-center" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,1)' }}>
          <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `conic-gradient(black ${data.tps / 50}deg, transparent ${data.tps / 50}deg)`,
                transform: 'rotate(-90deg)'
              }}
            />
            <div className="z-10 bg-white rounded-full w-16 h-16 flex flex-col items-center justify-center">
              <div className="text-xs font-bold">{Math.round(data.tps)}</div>
              <div className="text-[8px] mt-0.5">TPS</div>
            </div>
          </div>
          <div className="text-[10px] font-bold mt-1 truncate w-full text-center">{name}</div>
          <div className="text-[8px] mt-0.5 flex items-center justify-center">
            <Clock className="w-3 h-3 mr-0.5" />
            {data.blockTime?.toFixed(2)}s
          </div>
        </div>
      ))}
    </div>
  )
}

// You can switch between RealDataSource and MockDataSource here
const dataSource = new RealDataSource();

const ChaoticPopupChaosometer = () => {
  const { chainData, totalTps } = useDataSource(dataSource);
  const [blocks, setBlocks] = useState<Array<{ id: string; name: string; extrinsics: number; blockTime: number, blockNumber: number, timestamp: number }>>([]);
  const [visiblePopups, setVisiblePopups] = useState(['tps', 'blocktime', 'feed', 'leaderboard']);
  const [showHighTPS, setShowHighTPS] = useState(false);
  console.log("Chaindata:", chainData);
  // update blocks when chainData changes
  React.useEffect(() => {
    const newBlocks = Object.values(chainData).map(chain => ({
      id: `${chain.relay}-${chain.paraId}`,
      name: chain.name,
      extrinsics: chain.extrinsics,
      blockTime: chain.blockTime,
      blockNumber: chain.blockNumber,
      timestamp: chain.timestamp,
    }));

    setBlocks(prev => {
      const updatedBlocks = [...prev];

      for (const newBlock of newBlocks) {
        const existingIndex = updatedBlocks.findIndex(block => block.id === newBlock.id);

        if (existingIndex === -1) {
          // add new block to the start
          updatedBlocks.unshift(newBlock);
        } else if (newBlock.blockNumber > updatedBlocks[existingIndex].blockNumber) {
          // replace existing block with the newer block
          updatedBlocks.splice(existingIndex, 1);
          updatedBlocks.unshift(newBlock);
        }
      }

      // limit to the 100 most recent blocks
      return updatedBlocks.slice(0, 100);
    });

    setShowHighTPS(Object.values(chainData).some(chain => chain.tps > 1000));
  }, [chainData]);

  console.log("total tps", totalTps)

  const closePopup = (id: string) => {
    setVisiblePopups(prev => prev.filter(p => p !== id));
  };

  const leaderboard = useMemo(() => {
    return Object.values(chainData)
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 10);
  }, [chainData]);

  const backgroundElements = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      text: 'SPAM IS BEAUTIFUL',
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        transform: `rotate(${Math.random() * 360}deg)`,
        opacity: 0.1 + Math.random() * 0.2,
        fontSize: `${2 + Math.random() * 3}rem`,
      },
    }));
  }, []);

  const sendTweet = () => {
    const tweetText = `Check out the Spam Meter! Current TPS: ${totalTps.toFixed(2)}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  console.log("Blocks:", blocks);


  return (
    <div className="min-h-screen bg-white p-4 font-mono text-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          className="absolute top-0 left-0 z-50 w-24 sm:w-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <Button 
            onClick={sendTweet}
            className="bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              SEND TWEET <Rocket className="w-4 h-4 ml-2 animate-bounce" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-extrabold sm:font-bold mb-8 text-right sm:text-center pr-4 sm:pr-0 pl-28 sm:pl-0" style={{ textShadow: '4px 4px 0 #000' }}>
          <GlitchText text="SPAM METER" tps={totalTps} />
        </h1>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <AnimatePresence>
            {visiblePopups.includes('tps') && (
             <React.Fragment key="tps">
              <PopupWindow 
                title="TPS METER" 
                onClose={() => closePopup('tps')} 
                className={`col-span-12 ${showHighTPS ? 'sm:col-span-4 lg:col-span-3' : 'sm:col-span-7 lg:col-span-5'} h-[320px] w-full`}
              >
                <div className="w-full h-full flex flex-col items-center justify-center bg-white p-4">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-8 border-black flex items-center justify-center relative">
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{ 
                          background: `conic-gradient(black ${totalTps / 500}deg, transparent ${totalTps / 500}deg)`,
                          transform: 'rotate(-90deg)'
                        }}
                      />
                      <div className="z-10 bg-white rounded-full w-36 h-36 flex items-center justify-center">
                        <div className="text-3xl font-bold">{totalTps.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold mt-4">TPS</div>
                  </div>
                </div>
              </PopupWindow>
              </React.Fragment>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`col-span-12 sm:col-span-8 lg:col-span-6 ${showHighTPS ? 'block' : 'hidden'}`}
            >
              <PopupWindow 
                title="HIGH TPS CHAINS" 
                onClose={() => setShowHighTPS(false)} 
                className="h-[320px] w-full"
              >
                <div className="h-full overflow-hidden">
                  <HighTPSPopup chainData={chainData} />
                </div>
              </PopupWindow>
            </motion.div>
            {visiblePopups.includes('blocktime') && (
              <PopupWindow 
                title="BLOCKTIME HEATMAP" 
                onClose={() => closePopup('blocktime')} 
                className={`col-span-12 ${showHighTPS ? 'hidden lg:block lg:col-span-3' : 'sm:col-span-5 lg:col-span-4'} w-full`}
              >
                <div className="bg-white p-2">
                  <BlocktimeHeatmap chainData={chainData} />
                  <div className="mt-2 text-xs">
                    <span className="inline-block w-4  h-4 bg-[#cccccc] mr-1"></span>Slow (18s+)
                    <span className="inline-block w-4 h-4 bg-[#999999] ml-2 mr-1"></span>Normal (12-18s)
                    <span className="inline-block w-4 h-4 bg-[#666666] ml-2 mr-1"></span>Fast (6-12s)
                    <span className="inline-block w-4 h-4 bg-[#333333] ml-2 mr-1"></span>Very Fast (3-6s)
                    <span className="inline-block w-4 h-4 bg-[#000000] ml-2 mr-1"></span>Super Fast (&lt;3s)
                  </div>
                </div>
              </PopupWindow>
            )}
            {visiblePopups.includes('feed') && (
              <PopupWindow 
                title="BLOCK FEED" 
                onClose={() => closePopup('feed')} 
                className="col-span-12 sm:col-span-6 lg:col-span-7 w-full"
              >
                <div className="h-[300px]">
                  <BlockFeed blocks={blocks} />
                </div>
              </PopupWindow>
            )}
            {visiblePopups.includes('leaderboard') && (
              <PopupWindow 
                title="TPS LEADERBOARD" 
                onClose={() => closePopup('leaderboard')} 
                className="col-span-12  sm:col-span-6 lg:col-span-5 w-full"
              >
                <div className="w-full space-y-1 bg-white p-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold border-b-2 border-black pb-1 mb-2">
                    <span>Chain</span>
                    <span>TPS</span>
                    <span>Total Extrinsics</span>
                  </div>
                  {leaderboard.map((data, index) => (
                    <div key={data.name} className="grid grid-cols-3 gap-2 items-center text-xs border-b border-dotted border-black pb-1">
                      <span className="truncate">{index + 1}. {data.name}</span>
                      <span className="font-bold">{data.tps.toFixed(2)}</span>
                      <span>{data.accumulatedExtrinsics.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </PopupWindow>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 w-full">
          <BlockchainVisualizer blocks={blocks} />
        </div>
      </div>

      {/* Static, dithered background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {backgroundElements.map((element, index) => (
          <DitheredText key={index} text={element.text} style={element.style} />
        ))}
      </div>
    </div>
  )
}

export default ChaoticPopupChaosometer