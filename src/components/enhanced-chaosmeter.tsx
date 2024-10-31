import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, Activity, Hash, Trophy, Clock, Twitter } from "lucide-react"
import { polkadotChainsConfig, kusamaChainsConfig, ChainsConfig } from './chains'
import { LiveBlockFeed } from './LiveBlockFeed'
import AnimatedBackground from './AnimatedBackground'
import { ChainData } from './chains'
import ParticleEffect from './ParticleSystem'

const createChainNameMapping = (config: ChainsConfig): Record<number, string> => {
  const mapping: Record<number, string> = {};
  for (const chain in config) {
    mapping[config[chain].paraId] = config[chain].displayName;
  }
  return mapping;
};

const polkadotParaIdToName = createChainNameMapping(polkadotChainsConfig);
const kusamaParaIdToName = createChainNameMapping(kusamaChainsConfig);

type ChainDataMap = Record<string, ChainData>;

const RECENT_BLOCKS_COUNT = 100;
const RECENT_CHAIN_THRESHOLD = 18000; // 12.5 seconds to account for network latency
const CLEANUP_INTERVAL = 60000; // 1 minutes

export default function EnhancedChaosmeter() {
  const [chainData, setChainData] = useState<ChainDataMap>({});
  const [totalTps, setTotalTps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPolkadot, setShowPolkadot] = useState(true);
  const [isHovering, setIsHovering] = useState(false)


  const calculateChainTps = useCallback((chain: ChainData) => {
    if (chain.recentBlocks.length === 0) return 0;
    const totalExtrinsics = chain.recentBlocks.reduce((sum, block) => sum + block.extrinsics, 0);
    const totalBlockTime = chain.recentBlocks.reduce((sum, block) => sum + block.blockTime, 0);
    return totalBlockTime > 0 ? totalExtrinsics / totalBlockTime : 0;
  }, []);

  const calculateTotalTps = useCallback((data: ChainDataMap) => {
    const currentTime = Date.now();
    const recentChains = Object.values(data).filter(chain =>
      (currentTime - chain.timestamp) <= RECENT_CHAIN_THRESHOLD
    );

    return recentChains.reduce((acc, chain) => acc + calculateChainTps(chain), 0);
  }, [calculateChainTps]);

  const cleanupOldData = useCallback((data: ChainDataMap) => {
    const currentTime = Date.now();
    const updatedData = { ...data };
    Object.keys(updatedData).forEach(chainId => {
      if (currentTime - updatedData[chainId].timestamp > RECENT_CHAIN_THRESHOLD) {
        delete updatedData[chainId];
      }
    });
    return updatedData;
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('https://stream.freeside.network/events');

    eventSource.onopen = () => {
      console.log("Connected to event source");
    };

    eventSource.addEventListener('consumptionUpdate', (event) => {
      try {
        const rawData = JSON.parse(event.data);

        const chainId = `${rawData.relay}-${rawData.para_id}`;
        const nameMapping = rawData.relay === "Polkadot" ? polkadotParaIdToName : kusamaParaIdToName;
        const displayName = nameMapping[rawData.para_id] || `Unknown (${rawData.para_id})`;

        setChainData(prevChainData => {
          const updatedData = { ...prevChainData };

          if (!updatedData[chainId]) {
            updatedData[chainId] = {
              id: chainId,
              name: displayName,
              paraId: rawData.para_id,
              relay: rawData.relay,
              blockNumber: rawData.block_number,
              extrinsics: rawData.extrinsics_num,
              accumulatedExtrinsics: rawData.extrinsics_num,
              blockTime: rawData.block_time_seconds,
              timestamp: rawData.timestamp,
              recentBlocks: []
            };
          } else {
            updatedData[chainId] = {
              ...updatedData[chainId],
              blockNumber: rawData.block_number,
              extrinsics: rawData.extrinsics_num,
              accumulatedExtrinsics: (updatedData[chainId].accumulatedExtrinsics || 0) + rawData.extrinsics_num,
              blockTime: rawData.block_time_seconds,
              timestamp: rawData.timestamp
            };
          }

          // Update recent blocks
          updatedData[chainId].recentBlocks.unshift({
            extrinsics: rawData.extrinsics_num,
            blockTime: rawData.block_time_seconds,
            timestamp: rawData.timestamp
          });
          updatedData[chainId].recentBlocks = updatedData[chainId].recentBlocks.slice(0, RECENT_BLOCKS_COUNT);

          const newTotalTps = calculateTotalTps(updatedData);
          setTotalTps(newTotalTps);
          setIsLoading(false);

          return updatedData;
        });

      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    // Periodic cleanup
    const cleanupInterval = setInterval(() => {
      setChainData(prevData => cleanupOldData(prevData));
    }, CLEANUP_INTERVAL);

    return () => {
      eventSource.close();
      clearInterval(cleanupInterval);
    };
  }, [calculateTotalTps, cleanupOldData]);


  const filteredChainData = Object.values(chainData).filter(chain =>
    showPolkadot ? chain.relay === "Polkadot" : chain.relay === "Kusama"
  );

  const getBlockTimeColor = (time: number) => {
    if (time < 13) return 'from-green-500/30 to-green-500/10'
    if (time < 19) return 'from-yellow-500/30 to-yellow-500/10'
    if (time < 24) return 'from-orange-500/30 to-orange-500/10'
    return 'from-red-500/30 to-red-500/10'
  }

  const handleTweet = () => {
    const tweetText = encodeURIComponent(`The Spammening is real! Current TPS: ${totalTps.toFixed(2)} 🚀 #Polkadot @polkadot`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0a0b1e] p-4 overflow-hidden font-sans relative">
        {/* Tweet button positioned in the upper left corner */}
        <motion.button
          onClick={handleTweet}
          className="absolute top-4 left-4 px-4 py-2 rounded-full font-bold text-sm z-50 relative overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="relative flex items-center space-x-2 z-10">
            <Twitter className="w-4 h-4" />
            <span className="text-xs">SEND IT</span>
          </div>
          <div className="absolute inset-0 border-2 border-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 0 15px #0ff, 0 0 25px #0ff' }} />
        </motion.button>

        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6">
          <div className="lg:col-span-3 flex justify-center items-center space-x-2 mb-4">
            <Label htmlFor="network-toggle" className="text-white">Kusama</Label>
            <Switch
              id="network-toggle"
              checked={showPolkadot}
              onCheckedChange={setShowPolkadot}
            />
            <Label htmlFor="network-toggle" className="text-white">Polkadot</Label>
          </div>
          {/* Left Column - Block Time Heatmap */}
          <div className="hidden md:block">
            <Card className="bg-opacity-10 bg-black backdrop-blur-sm border-pink-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 animate-pulse" />
              <div className="p-4">
                <h2 className="text-2xl font-bold text-[#4ade80] mb-4 flex items-center">
                  <Clock className="mr-2" />
                  Blocktime Heatmap
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {filteredChainData.map((data) => (
                    <Tooltip key={data.id}>
                      <TooltipTrigger>
                        <motion.div
                          className={`h-12 rounded-md flex items-center justify-center bg-gradient-to-br ${getBlockTimeColor(data.blockTime)} relative overflow-hidden`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-xs font-bold text-white z-10">{data.name}</span>
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: data.blockTime / 12 }}
                            transition={{ duration: 0.5 }}
                          />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{data.name}</p>
                        <p>Block Time: {data.blockTime?.toFixed(2)}s</p>
                        <p>Last Block: {data.blockNumber}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Card>
          </div>


          {/* Center Column - Main TPS Meter */}
          <Card className="p-6 bg-opacity-10 bg-black backdrop-blur-sm border-pink-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 animate-pulse" />
            <div className="relative flex flex-col items-center">
              <motion.h1
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                CHAOSMETER
              </motion.h1>

              <div className="w-64 h-32 relative mb-8">
                <div className="absolute inset-0 border-t-[12px] border-l-[12px] border-r-[12px] rounded-t-full border-gray-700/50" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 origin-bottom"
                  style={{
                    height: '100%',
                    background: `conic-gradient(from -90deg at 50% 100%, 
                      ${totalTps < 300 ? '#4ade80' : totalTps < 600 ? '#facc15' : '#ef4444'} ${(totalTps / 1000) * 180}deg, 
                      transparent ${(totalTps / 1000) * 180}deg 180deg)`,
                    borderRadius: '150px 150px 0 0',
                  }}
                  animate={{ rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                  ) : (
                    <motion.div
                      className="text-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        color: totalTps < 300 ? '#4ade80' : totalTps < 600 ? '#facc15' : '#ef4444'
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <span className="text-3xl font-bold">
                        {totalTps.toFixed(2)}
                      </span>
                      <span className="text-xl block">TPS</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* High TPS Chain Meters */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 w-full">
                <AnimatePresence>
                  {filteredChainData
                    .filter(chain => chain.extrinsics / chain.blockTime > 50)
                    .sort((a, b) => (b.extrinsics / b.blockTime) - (a.extrinsics / a.blockTime))
                    .slice(0, 12)
                    .map(chain => (
                      <Tooltip key={chain.id}>
                        <TooltipTrigger>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <div className="w-24 h-12 mx-auto">
                              <div className="absolute inset-0 border-t-[6px] border-l-[6px] border-r-[6px] rounded-t-full border-gray-700/50" />
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 origin-bottom"
                                style={{
                                  height: '100%',
                                  background: `conic-gradient(from -90deg at 50% 100%, 
          #ef4444 ${(chain.extrinsics / chain.blockTime / 1000) * 180}deg, 
          transparent ${(chain.extrinsics / chain.blockTime / 1000) * 180}deg 180deg)`,
                                  borderRadius: '150px 150px 0 0',
                                }}
                                animate={{
                                  rotate: [0, -2, 2, 0],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <motion.span
                                  className="text-xs font-bold text-green-400"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                  {chain.name}
                                </motion.span>
                                <span className="text-[10px] text-green-400">{(chain.extrinsics / chain.blockTime).toFixed(0)} TPS</span>
                              </div>
                            </div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{chain.name}</p>
                          <p>TPS: {(chain.extrinsics / chain.blockTime).toFixed(2)}</p>
                          <p>Block Time: {chain.blockTime?.toFixed(2)}s</p>
                          <p>Last Block: {chain.blockNumber}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}

                </AnimatePresence>
              </div>

            </div>
          </Card>




          {/* Right Column - Leaderboard */}
          <Card className="p-6 bg-opacity-10 bg-black backdrop-blur-sm border-pink-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 animate-pulse" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                <Trophy className="mr-2" />
                {showPolkadot ? 'Polkadot' : 'Kusama'} Leaderboard
              </h2>
              <p className="text-cyan-400 mb-4">
                Chains connected: {filteredChainData.length}
              </p>
              <div className="space-y-2">
                {filteredChainData
                  .map((chain) => ({
                    ...chain,
                    tps: (chain.extrinsics / chain.blockTime).toFixed(2),
                  }))
                  .sort((a, b) => b.accumulatedExtrinsics - a.accumulatedExtrinsics)
                  .slice(0, 10)
                  .map((chain, index) => (
                    <motion.div
                      key={chain.id}
                      className="flex justify-between items-center p-2 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}</span>
                        <div className="flex flex-col">
                          <span className="text-purple-400">{chain.name}</span>
                          <span className="text-green-400 text-sm">{chain.tps} TPS</span>
                        </div>
                      </div>
                      <span className="text-green-400">{chain.accumulatedExtrinsics.toLocaleString()} transactions</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </Card>
        </div>

        <LiveBlockFeed chainData={chainData} showPolkadot={showPolkadot} />

        {/* Enhanced Particle Effects */}
        <ParticleEffect tps={totalTps} />


        {/* Animated Background Lines */}
        <AnimatedBackground />
      </div>
    </TooltipProvider>
  )
}
