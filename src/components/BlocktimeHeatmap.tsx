import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BlocktimeHeatmapProps {
  chainData: Record<string, { name: string, blockTime: number }>;
}

export const BlocktimeHeatmap: React.FC<BlocktimeHeatmapProps> = ({ chainData }) => {
  const getColor = (blockTime: number) => {
    if (blockTime < 4) return '#0000ff';
    if (blockTime < 7) return '#333333';
    if (blockTime < 13) return '#666666';
    if (blockTime < 19) return '#999999';
    return '#cccccc';
  };

  const getSize = (blockTime: number) => {
    if (blockTime < 4) return 'w-2 h-2 sm:w-3 sm:h-3';
    if (blockTime < 7) return 'w-3 h-3 sm:w-4 sm:h-4';
    if (blockTime < 13) return 'w-4 h-4 sm:w-5 sm:h-5';
    return 'w-5 h-5 sm:w-6 sm:h-6';
  };

  const sortedChainData = useMemo(() => {
    return Object.entries(chainData).sort(([, a], [, b]) => a.blockTime - b.blockTime);
  }, [chainData]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="grid grid-cols-10 gap-0.5 p-1 bg-white rounded-lg shadow-inner">
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
                {data.blockTime < 3 && (
                  <div 
                    className={`absolute inset-0 ${getSize(data.blockTime)} border-2 border-white rounded-sm`}
                    style={{
                      animation: 'pulse 0.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      opacity: 1,
                    }}
                  />
                )}
              </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-black text-white p-2 rounded shadow-lg">
              <p className="font-bold">{data.name}</p>
              <p>Blocktime: {data.blockTime?.toFixed(2)}s</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};