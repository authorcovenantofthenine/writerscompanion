import React from 'react';

export default function StatBox({ label, value }) {
  return (
    <div className="border border-secondary/50 bg-card/40 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center h-auto min-h-[80px]">
      <span className="text-2xl sm:text-3xl font-display text-primary mb-1">{value}</span>
      <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-foreground/60">{label}</span>
    </div>
  );
}