import React from 'react';
import TriquetraSymbol from '@/components/TriquetraSymbol.jsx';

export default function LoadingScreen() {
  return (
    <div 
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#12091A] z-[100]"
      role="status"
      aria-live="polite"
      aria-label="Loading, the circle is gathering"
    >
      <div className="animate-triquetra-rotate animate-glow-pulse flex items-center justify-center">
        <TriquetraSymbol 
          className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] text-[#D4AF56]" 
        />
      </div>
      <p className="font-serif-display italic text-[#F5EEDC] text-sm sm:text-base lg:text-lg mt-4 sm:mt-5 lg:mt-8 animate-text-fade">
        The circle is gathering...
      </p>
    </div>
  );
}