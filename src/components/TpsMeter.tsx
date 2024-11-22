import React, { useState, useEffect } from 'react';
import { PopupWindow } from './PopupWindow'; // Assuming this component exists

interface TPSMeterProps {
  totalTps: number;
  onClose: () => void;
}

export const TPSMeter: React.FC<TPSMeterProps> = ({ totalTps, onClose }) => {
  // Logarithmic scale calculation
  const getScaledAngle = (tps: number) => {
    const minTps = 1; // To avoid log(0)
    const maxTps = 60000; // Maximum TPS
    const logMinTps = Math.log10(minTps);
    const logMaxTps = Math.log10(maxTps);
    const logTps = Math.log10(Math.max(minTps, tps));

    // Map the logarithmic value to an angle between 0 and 360 degrees
    return ((logTps - logMinTps) / (logMaxTps - logMinTps)) * 360;
  };

  const [maxTps, setMaxTps] = useState(totalTps);

  // Update maxTps whenever totalTps increases
  useEffect(() => {
    if (totalTps > maxTps) {
      setMaxTps(totalTps);
    }
  }, [totalTps, maxTps]);

  const angle = getScaledAngle(totalTps);

  return (
    <PopupWindow
      title="TPS METER"
      onClose={onClose}
      className="col-span-12 sm:col-span-4 lg:col-span-3 h-[320px] sm:h-[320px] w-full"
    >
      <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-56 h-56 rounded-full border-8 border-white flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(white ${angle}deg, transparent ${angle}deg)`,
                transform: 'rotate(-90deg)',
              }}
            />
            <div className="z-10 bg-black rounded-full w-44 h-44 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-white">{totalTps.toFixed(1)}</div>
              <div className="text-xl font-bold text-white">TPS</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">Max: {maxTps.toFixed(1)}</div>
        </div>
      </div>
    </PopupWindow>
  );
};
