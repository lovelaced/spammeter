import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { ChainData } from './types';
import { kusamaChainsConfig } from './chains';

interface HighTPSPopupProps {
  chainData: Record<string, ChainData>;
}

const renderChainName = (chain: ChainData) => {
  const chainConfig = Object.values(kusamaChainsConfig).find(c => c.paraId === chain.paraId);
  return chainConfig?.displayName || chain.name;
};


export const HighTPSPopup: React.FC<HighTPSPopupProps> = ({ chainData }) => {
  const highTPSChains = Object.entries(chainData)
    .filter(([, data]) => data.instantTps > 100 && Number.isFinite(data.instantTps))
    .sort(([, a], [, b]) => b.instantTps - a.instantTps);

  return (
    <div className="w-full h-full bg-white overflow-auto p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {highTPSChains.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center h-full">
          <div className="relative">
            <Zap className="w-20 h-20 text-[#07FFFF] animate-pulse-subtle" />
            <div className="absolute inset-0 w-20 h-20 bg-[#07FFFF] rounded-full filter blur-xl opacity-30 animate-pulse-subtle"></div>
          </div>
          <div className="text-black text-sm mt-2">charging...</div>
        </div>
      ) : (
        highTPSChains.map(([chainKey, data]) => (
          <div
            key={chainKey}
            className="bg-white border-2 border-black p-2 flex flex-col items-center justify-center"
            style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,1)' }}
          >
            <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(black ${data.instantTps / 50}deg, transparent ${
                    data.tps / 50
                  }deg)`,
                  transform: 'rotate(-90deg)',
                }}
              />
              <div className="z-10 bg-white rounded-full w-16 h-16 flex flex-col items-center justify-center">
                <div className="text-xs font-bold">{Math.round(data.instantTps)}</div>
                <div className="text-[8px] mt-0.5">TPS</div>
              </div>
            </div>
            <div className="text-[10px] font-bold mt-1 truncate w-full text-center">
              {renderChainName(data)}
            </div>
            <div className="text-[8px] mt-0.5 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-0.5" />
              {data.blockTime?.toFixed(2)}s
            </div>
          </div>
        ))
      )}
    </div>
  );
};