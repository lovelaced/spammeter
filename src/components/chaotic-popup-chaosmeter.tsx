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
import { BlockFeed } from './BlockFeed';
import { HighTPSPopup } from './HighTPSPopup';
import { TPSMeter } from './TpsMeter';
import { ChainData } from './types';
import { kusamaChainsConfig } from './chains';
import { Dropdown } from './Dropdown';
import SpamButton from './SpamButton';


const ChaoticPopupChaosometer = () => {
  const [selectedChain, setSelectedChain] = useState<string>(''); // Manage the selected chain state
  const [useMockData] = useState(false)
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

  //const toggleDataSource = () => {
 //   setUseMockData(prev => !prev)
 // }

  const closePopup = (id: string) => {
    setVisiblePopups(prev => prev.filter(p => p !== id));
  };

  const leaderboard = useMemo(() => {
    return Object.values(chainData)
      .filter((chain) => !isNaN(chain.tps) && isFinite(chain.tps)) // filter out NaN or Infinity
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 10);
  }, [chainData]);

  const sendTweet = () => {
    const tweetText = `Just saw ${totalTps.toFixed(2)} TPS during the @Polkadot spammening! #expectchaos`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const renderChainName = (chain: ChainData) => {
    const chainConfig = Object.values(kusamaChainsConfig).find(c => c.paraId === chain.paraId);

    if (chainConfig && chainConfig.icon) {
      const Icon = chainConfig.icon;
      return (
        <div className="p-1 rounded-full" style={{ backgroundColor: chainConfig.color }}>
          <Icon className="w-4 h-4 text-white" aria-label={chain.name} />
        </div>
      );
    }

    return <span className="truncate">{chain.name}</span>;
  };

  return (
<div className="min-h-screen bg-white p-4 font-mono text-black relative overflow-hidden">
  <div className="max-w-6xl mx-auto relative">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4">
      <div className="flex items-center space-x-2">
        <img
          src="/Polkadot_Token_Pink.svg"
          alt="Polkadot Logo"
          className="w-6 h-6 sm:w-9 sm:h-9"
        />
        <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold">
          <GlitchText text="SPAMMENING" tps={totalTps} />
        </h1>
      </div>
      {/* Container for Dropdown and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 pt-4 sm:pt-0">
        {/* Dropdown */}
        <div className="mb-2 sm:mb-0">
          <Dropdown selectedChain={selectedChain} setSelectedChain={setSelectedChain} />
        </div>
        {/* Buttons Container */}
        <div className="flex space-x-2">
          {/* SpamButton with SpamStatus */}
          <div className="flex flex-col items-start space-y-1">
            <SpamButton rpcUrl={selectedChain} disabled={!selectedChain} />
          </div>
          {/* Send Tweet Button */}
          <Button
            onClick={sendTweet}
            className="h-[38px] bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold hover:bg-white hover:text-black transition-colors active:shadow-none relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              SEND TWEET
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#7916F3] to-[#ea4070] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
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
                  className={`col-span-12 ${showHighTPS ? 'hidden lg:block lg:col-span-3' : 'sm:col-span-5 lg:col-span-4'} w-full`}
                >
                  <BlocktimeHeatmap chainData={chainData} />
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
                    <BlockFeed chainData={chainData} />
                  </div>
                </PopupWindow>
              </React.Fragment>
            )}
            {visiblePopups.includes('leaderboard') && (
              <React.Fragment key="leaderboard">
                <PopupWindow
                  title="TPS LEADERBOARD"
                  onClose={() => closePopup('leaderboard')}
                  className="col-span-12 sm:col-span-6 lg:col-span-5 w-full"
                >
                  <div className="w-full h-full space-y-1 bg-white p-2">
                    {/* Updated Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold border-b-2 border-black pb-1 mb-2">
                      <span className="col-span-1">#</span>
                      <span className="col-span-4">Chain</span>
                      <span className="col-span-3">TPS</span>

                      {/* Responsive Text for "Total Transactions" */}
                      <span className="col-span-4">
                        <span className="hidden sm:inline">Total Transactions</span>
                        <span className="inline sm:hidden">Total Txns</span>
                      </span>
                    </div>
                    {/* Data Rows */}
                    {leaderboard.map((data, index) => (
                      <div
                        key={data.name}
                        className="grid grid-cols-12 gap-2 items-center text-xs border-b border-dotted border-primary-foreground/20 pb-1"
                      >
                        <span className="col-span-1">{index + 1}.</span>
                        <span className="col-span-4 flex items-center gap-1">
                          {renderChainName(data)}
                        </span>
                        <span className="col-span-3 font-bold">
                          {data.tps === 0 || !isFinite(data.tps) || isNaN(data.tps)
                            ? '--'
                            : data.tps.toFixed(2)}
                        </span>
                        <span className="col-span-4">
                          {data.accumulatedExtrinsics.toLocaleString()}
                        </span>
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
