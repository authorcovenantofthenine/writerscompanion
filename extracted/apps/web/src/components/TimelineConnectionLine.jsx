import React from 'react';

export default function TimelineConnectionLine({ startX, startY, endX, endY, colorClass = 'char-gold' }) {
  // A simple SVG line component to draw connections
  // In a real complex app, we'd calculate exact DOM rects. Here we assume relative coordinates within an SVG overlay.
  
  const strokeColor = `hsl(var(--${colorClass}))`;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
      <defs>
        <filter id={`glow-${colorClass}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d={`M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray="4 4"
        filter={`url(#glow-${colorClass})`}
        className="opacity-60"
      />
    </svg>
  );
}