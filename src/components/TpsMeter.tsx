import React from 'react';
import { PopupWindow } from './PopupWindow'; // Assuming this component exists

interface TPSMeterProps {
  totalTps: number;
  onClose: () => void;
}

export const TPSMeter: React.FC<TPSMeterProps> = ({ totalTps, onClose }) => {
  // Logarithmic scale calculation
  const getScaledAngle = (tps: number) => {
    const minTps = 1; // To avoid log(0)
    const maxTps = 100000; // Maximum TPS
    const logMinTps = Math.log10(minTps);
    const logMaxTps = Math.log10(maxTps);
    const logTps = Math.log10(Math.max(minTps, tps));
    
    // Map the logarithmic value to an angle between 0 and 360 degrees
    return ((logTps - logMinTps) / (logMaxTps - logMinTps)) * 360;
  };

  const angle = getScaledAngle(totalTps);

  return (
    <PopupWindow
      title="TPS METER"
      onClose={onClose}
      className="col-span-12 sm:col-span-4 lg:col-span-3 h-[320px] w-full"
    >
      <div className="w-full h-full flex items-center justify-center bg-black p-4">
        <div className="relative w-full pb-[100%]">
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-full border-8 border-white flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(white ${angle}deg, transparent ${angle}deg)`,
                  transform: 'rotate(-90deg)',
                }}
              />
              <div className="z-10 bg-black rounded-full w-[calc(100%-46px)] h-[calc(100%-46px)] flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white">{totalTps.toFixed(1)}</div>
                <div className="text-xl font-bold mt-2 text-white">TPS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopupWindow>
  );
};