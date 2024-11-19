import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  tps: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, tps }) => {
  const [glitchedText, setGlitchedText] = useState(text);

  useEffect(() => {
    const glitchChars = '!<>-_\\/[]{}—=+*^?#________';
    const intensity = Math.min(tps / 50000, 1); // Normalize TPS to 0-1 range
    const randomFactor = Math.random() * 100; // Random value between 0 and 100
    const speed = Math.max(50, 500 - tps / 50 + randomFactor); // Adjust speed based on TPS with a random element
    const interval = setInterval(() => {
      setGlitchedText(
        text
          .split('')
          .map(char =>
            Math.random() < intensity
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char
          )
          .join('')
      );
    }, speed);

    return () => clearInterval(interval);
  }, [text, tps]);

  return <span className="font-unbounded">{glitchedText}</span>;
};
