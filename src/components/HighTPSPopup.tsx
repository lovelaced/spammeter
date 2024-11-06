import React from 'react';
import { Clock } from 'lucide-react';

interface HighTPSPopupProps {
  chainData: Record<string, { tps: number; blockTime: number }>;
}

export const HighTPSPopup: React.FC<HighTPSPopupProps> = ({ chainData }) => {
  const highTPSChains = Object.entries(chainData)
    .filter(([, data]) => data.tps > 1000)
    .sort(([, a], [, b]) => b.tps - a.tps);

  return (
    <div className="w-full h-full overflow-auto p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {highTPSChains.map(([name, data]) => (
        <div
          key={name}
          className="bg-white border-2 border-black p-2 flex flex-col items-center justify-center"
          style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,1)' }}
        >
          <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(black ${data.tps / 50}deg, transparent ${
                  data.tps / 50
                }deg)`,
                transform: 'rotate(-90deg)',
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
  );
};