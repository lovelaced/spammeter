import React from 'react';

interface DitheredTextProps {
  text: string;
  style: React.CSSProperties;
}

export const DitheredText: React.FC<DitheredTextProps> = ({ text, style }) => (
  <div
    className="absolute text-6xl font-bold"
    style={{
      ...style,
      color: 'black',
      maskImage:
        "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='black'/%3E%3Crect x='2' y='2' width='1' height='1' fill='black'/%3E%3C/svg%3E\")",
      maskSize: '4px 4px',
      zIndex: -1,
    }}
  >
    {text}
  </div>
);
