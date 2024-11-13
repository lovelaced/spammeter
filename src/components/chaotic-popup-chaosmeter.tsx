'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDataSource } from './useDataSource';
import { RealDataSource } from './RealDataSource';
import { TestnetDataSource } from './TestnetDataSource';
import { PopupWindow } from './PopupWindow';
import { GlitchText } from './GlitchText';
import { BlockchainVisualizer } from './BlockchainVisualizer';
import { BlocktimeHeatmap } from './BlocktimeHeatmap';
import { DataSourceSwitch } from './DataSourceSwitch';
import { BlockFeed } from './BlockFeed';
import { HighTPSPopup } from './HighTPSPopup';
import { TPSMeter } from './TpsMeter';
import { ChainData } from './types';
import { westendChainsConfig } from './chains';


const ChaoticPopupChaosometer = () => {
  const [useMockData, setUseMockData] = useState(true)
  const dataSource = useMemo(() => useMockData ? new TestnetDataSource() : new RealDataSource(), [useMockData])
  const { chainData, totalTps } = useDataSource(dataSource);
  const [blocks, setBlocks] = useState<
    Array<{
      id: string;
      name: string;
      extrinsics: number;
      blockTime: number;
      blockNumber: number;
      timestamp: number;
      weight: number;
    }>
  >([]);
  const [visiblePopups, setVisiblePopups] = useState(['tps', 'blocktime', 'feed', 'leaderboard']);
  const [showHighTPS, setShowHighTPS] = useState(true);

  useEffect(() => {
    const newBlocks = Object.values(chainData).map(chain => ({
      id: `${chain.relay}-${chain.paraId}`,
      name: chain.name,
      extrinsics: chain.extrinsics,
      blockTime: chain.blockTime,
      blockNumber: chain.blockNumber,
      timestamp: chain.timestamp,
      weight: chain.weight,
    }));

    setBlocks(prev => {
      const updatedBlocks = [...prev];

      for (const newBlock of newBlocks) {
        const existingIndex = updatedBlocks.findIndex(block => block.id === newBlock.id);

        if (existingIndex === -1) {
          // Add new block to the start
          updatedBlocks.unshift(newBlock);
        } else if (newBlock.blockNumber > updatedBlocks[existingIndex].blockNumber) {
          // Replace existing block with the newer block
          updatedBlocks.splice(existingIndex, 1);
          updatedBlocks.unshift(newBlock);
        }
      }

      // Get current time
      const currentTime = Date.now(); // In milliseconds
      const cutoffTimestamp = currentTime - 60 * 1000; // 1 minute ago

      // Filter out blocks older than 1 minute
      const prunedBlocks = updatedBlocks.filter(block => block.timestamp >= cutoffTimestamp);

      // Limit to the 100 most recent blocks
      return prunedBlocks.slice(0, 100);
    });

    setShowHighTPS(true);
  }, [chainData]);

  const toggleDataSource = () => {
    setUseMockData(prev => !prev)
  }

  const closePopup = (id: string) => {
    setVisiblePopups(prev => prev.filter(p => p !== id));
  };

  const leaderboard = useMemo(() => {
    return Object.values(chainData)
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 10);
  }, [chainData]);

  const sendTweet = () => {
    const tweetText = `Just saw ${totalTps.toFixed(2)} TPS during the @Polkadot spammening! #expectchaos`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const renderChainName = (chain: ChainData) => {
    const chainConfig = Object.values(westendChainsConfig).find(c => c.paraId === chain.paraId)
    
    if (chainConfig && chainConfig.icon) {
      const Icon = chainConfig.icon
      return (
        <div className={`p-1 rounded-full ${chainConfig.color}`}>
          <Icon className="w-4 h-4 text-white" aria-label={chain.name} />
        </div>
      )
    }
    
    return <span className="truncate">{chain.name}</span>
  }

  return (
    <div className="min-h-screen bg-white p-4 font-mono text-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
          <img
              src="/Polkadot_Token_Pink.svg"
              alt="Polkadot Logo"
              className="w-9 h-9"
            />
            <h1
              className="text-3xl sm:text-4xl font-extrabold sm:font-bold"
            >
              <GlitchText text="SPAMMENING" tps={totalTps} />
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <DataSourceSwitch useMockData={useMockData} onToggle={toggleDataSource} />
            <Button
              onClick={sendTweet}
              className="bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold hover:bg-white hover:text-black transition-colors hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                SEND TWEET
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <AnimatePresence>
            <React.Fragment key="tps">
              {visiblePopups.includes('tps') && (
                <TPSMeter
                  key="tps"
                  totalTps={totalTps}
                  onClose={() => closePopup('tps')}
                />
              )}
            </React.Fragment>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`col-span-12 sm:col-span-8 lg:col-span-6 ${showHighTPS ? 'block' : 'hidden'}`}
            >
              <React.Fragment key="high-tps">
                <PopupWindow
                  title="HIGH TPS CHAINS"
                  onClose={() => setShowHighTPS(false)}
                  className="h-[320px] w-full"
                >
                  <div className="h-full overflow-hidden">
                    <HighTPSPopup chainData={chainData} />
                  </div>
                </PopupWindow>
              </React.Fragment>
            </motion.div>
            {visiblePopups.includes('blocktime') && (
              <React.Fragment key="blocktime">
                <PopupWindow
                  title="BLOCKTIME HEATMAP"
                  onClose={() => closePopup('blocktime')}
                  className={`col-span-12 ${showHighTPS ? 'hidden lg:block lg:col-span-3' : 'sm:col-span-5 lg:col-span-4'
                    } w-full`}
                >
                  <div className="bg-black p-2">
                    <BlocktimeHeatmap chainData={chainData} />
                  </div>
                </PopupWindow>
              </React.Fragment>
            )}
            {visiblePopups.includes('feed') && (
              <React.Fragment key="feed">
                <PopupWindow
                  title="BLOCK FEED"
                  onClose={() => closePopup('feed')}
                  className="col-span-12 sm:col-span-6 lg:col-span-7 w-full"
                >
                  <div className="h-[325px]">
                    <BlockFeed blocks={blocks} />
                  </div>
                </PopupWindow>
              </React.Fragment>
            )}
            {visiblePopups.includes('leaderboard') && (
              <React.Fragment key="leaderboard">
                <PopupWindow
                  title="TPS LEADERBOARD"
                  onClose={() => closePopup('leaderboard')}
                  className="col-span-12  sm:col-span-6 lg:col-span-5 w-full"
                >
                  <div className="w-full h-full space-y-1 bg-white p-2">
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold border-b-2 border-black pb-1 mb-2">
                      <span>Chain</span>
                      <span>TPS</span>
                      <span>Total Transactions</span>
                    </div>
                    {leaderboard.map((data, index) => (
                      <div
                        key={data.name}
                        className="grid grid-cols-12 gap-2 items-center text-xs border-b border-dotted border-primary-foreground/20 pb-1"
                      >
                        <span className="col-span-1">{index + 1}.</span>
                        <span className="col-span-4 flex items-center gap-1">
                          {renderChainName(data)}
                        </span>
                        <span className="col-span-3 font-bold">{data.tps.toFixed(2)}</span>
                        <span className="col-span-4">{data.accumulatedExtrinsics.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </PopupWindow>
              </React.Fragment>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 w-full">
          <BlockchainVisualizer blocks={blocks} />
        </div>
      </div>

      {/* Static, dithered background elements */}
      <div className="fixed inset-0 pointer-events-none">
      </div>
    </div>
  );
};

export default ChaoticPopupChaosometer;
