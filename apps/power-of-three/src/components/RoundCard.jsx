import React from 'react';

export default function RoundCard({ round, writerName, isCurrent }) {
  return (
    <div className={`border rounded-xl p-4 sm:p-6 w-full flex flex-col items-center justify-center transition-all duration-300 ${
      isCurrent
        ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,86,0.1)]'
        : 'border-secondary/50 bg-card/30'
    }`}>
      <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-foreground/60 mb-2">
        Round {round.roundNumber}
      </span>
      <h3 className={`text-xl sm:text-2xl font-serif-display text-center ${isCurrent ? 'text-primary italic' : 'text-foreground/80'}`}>
        {writerName || 'Awaiting'}
      </h3>
      <span className={`text-[10px] sm:text-xs mt-3 sm:mt-4 uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
        {isCurrent ? 'In the Circle' : 'Awaiting'}
      </span>
    </div>
  );
}
