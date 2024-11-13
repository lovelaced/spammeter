import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BlocktimeHeatmapProps {
  chainData: Record<string, { name: string, blockTime: number }>;
}

export const BlocktimeHeatmap: React.FC<BlocktimeHeatmapProps> = ({ chainData }) => {
  const getColor = (blockTime: number) => {
    if (blockTime < 7) return '#ffff00'; // Yellow
    if (blockTime < 12) return '#ffffff'; // White
    if (blockTime < 13) return '#999999'; // Light Gray
    if (blockTime < 19) return '#666666'; // Dark Gray
    return '#333333'; // Very Dark Gray
  };

  const getSize = (blockTime: number) => {
    if (blockTime < 4) return 'w-2 h-2 sm:w-3 sm:h-3';
    if (blockTime < 7) return 'w-3 h-3 sm:w-4 sm:h-4';
    if (blockTime < 13) return 'w-4 h-4 sm:w-5 sm:h-5';
    return 'w-5 h-5 sm:w-6 sm:h-6';
  };

  const sortedChainData = useMemo(() => {
    return Object.entries(chainData)
      .filter(([, data]) => data.blockTime !== undefined && !isNaN(data.blockTime) && data.blockTime !== 0)
      .sort(([, a], [, b]) => {
        if (a.blockTime === b.blockTime) {
          return a.name.localeCompare(b.name);
        }
        return a.blockTime - b.blockTime;
      });
  }, [chainData]);

  return (
    <div className="w-full h-full bg-black" style={{ margin: '-1px', padding: '1px' }}>
      <TooltipProvider delayDuration={0}>
        <div className="w-full h-full grid grid-cols-10 gap-0.5 p-1 bg-black rounded-lg shadow-inner overflow-hidden">
          {sortedChainData.map(([id, data]) => (
            <Tooltip key={id}>
              <TooltipTrigger>
                <div className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
                  <div
                    className={`relative flex items-center justify-center ${getSize(data.blockTime)}`}
                  >
                    <div
                      className={`absolute inset-0 ${getSize(data.blockTime)}`}
                      style={{
                        backgroundColor: getColor(data.blockTime),
                        maskImage:
                          "url(\"data:image/svg+xml,%3Csvg width='2' height='2' viewBox='0 0 2 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='black'/%3E%3Crect x='1' y='1' width='1' height='1' fill='black'/%3E%3C/svg%3E\")",
                        maskSize: '2px 2px',
                        opacity: 1,
                      }}
                    />
                    {data.blockTime < 7 && (
                      <div
                        className={`absolute inset-0 ${getSize(data.blockTime)} border-2 border-black rounded-sm animate-[pulse_0.3s_cubic-bezier(0.4,0,0.6,1)_infinite]`}
                      />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-black p-2 rounded shadow-lg">
                <p className="font-bold">{data.name}</p>
                <p>Blocktime: {data.blockTime?.toFixed(2)}s</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};