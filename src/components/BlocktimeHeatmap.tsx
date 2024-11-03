import React, { useMemo } from 'react';

interface BlocktimeHeatmapProps {
  chainData: Record<string, { blockTime: number }>;
}

export const BlocktimeHeatmap: React.FC<BlocktimeHeatmapProps> = ({ chainData }) => {
  const getColor = (blockTime: number) => {
    if (blockTime < 3) return '#000000';
    if (blockTime < 6) return '#333333';
    if (blockTime < 12) return '#666666';
    if (blockTime < 18) return '#999999';
    return '#cccccc';
  };

  const sortedChainData = useMemo(() => {
    return Object.entries(chainData).sort(([, a], [, b]) => a.blockTime - b.blockTime);
  }, [chainData]);

  return (
    <div className="grid grid-cols-10 gap-1">
      {sortedChainData.map(([name, data]) => (
        <div
          key={name}
          className="w-4 h-4 sm:w-6 sm:h-6 relative"
          style={{
            backgroundColor: getColor(data.blockTime),
            maskImage:
              "url(\"data:image/svg+xml,%3Csvg width='2' height='2' viewBox='0 0 2 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='black'/%3E%3Crect x='1' y='1' width='1' height='1' fill='black'/%3E%3C/svg%3E\")",
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
  );
};
