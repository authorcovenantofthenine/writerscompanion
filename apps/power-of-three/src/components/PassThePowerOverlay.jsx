import React, { useEffect, useRef } from 'react';
import TriquetraSymbol from '@/components/TriquetraSymbol.jsx';

export default function PassThePowerOverlay({ isVisible, onAnimationComplete }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(() => {
        onAnimationComplete?.();
      }, 2800);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(18, 9, 26, 0.97)' }}
      aria-live="assertive"
      aria-label="Passing the power to the next writer"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="animate-triquetra-rotate animate-glow-pulse">
          <TriquetraSymbol className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] text-[#D4AF56]" />
        </div>

        <div className="text-center space-y-3 animate-text-fade">
          <p className="font-display text-3xl sm:text-4xl text-[#D4AF56] tracking-wide">
            The Power Passes
          </p>
          <p className="font-serif-display italic text-[#F5EEDC]/70 text-lg sm:text-xl">
            The circle turns. A new writer steps forward.
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#D4AF56]/60"
              style={{ animation: `timerPulse 1.2s ease-in-out ${i * 0.4}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
