import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ currentRound }) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      if (!currentRound || !currentRound.deadline || !currentRound.round_length) {
        setDaysRemaining(0);
        setTotalDays(0);
        return;
      }
      
      const deadlineDate = new Date(currentRound.deadline);
      const now = new Date();
      const diffTime = deadlineDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysRemaining(diffDays);
      setTotalDays(currentRound.round_length);
    };

    calculateDays();
    
    // Update daily
    const interval = setInterval(calculateDays, 86400000);
    return () => clearInterval(interval);
  }, [currentRound]);

  if (!currentRound || !currentRound.started_at) {
    return (
      <div className="flex items-center justify-center h-[80px]">
        <span className="text-[var(--timer-parchment)] font-serif-display text-sm italic opacity-70">
          Awaiting the start...
        </span>
      </div>
    );
  }

  const displayDays = Math.max(0, daysRemaining);
  const safeTotal = totalDays > 0 ? totalDays : 1;
  const progressPercentage = Math.max(0, Math.min(100, (displayDays / safeTotal) * 100));

  let ringColor = 'var(--timer-gold)';
  if (progressPercentage < 25 || daysRemaining <= 3) {
    ringColor = 'var(--timer-red)';
  } else if (progressPercentage <= 50) {
    ringColor = 'var(--timer-amber)';
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  const isPulsing = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <div className="relative group flex flex-col items-center justify-center">
      <div className={`relative w-[80px] h-[80px] ${isPulsing ? 'animate-timer-pulse' : ''}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 80 80"
          aria-label="Days remaining countdown timer"
        >
          <title>Countdown Timer</title>
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="var(--timer-amethyst)"
            strokeWidth="4"
            className="opacity-20"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="timer-ring-transition"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl" style={{ color: ringColor }}>
            {displayDays}
          </span>
        </div>
      </div>
      
      <div className="mt-1 text-center">
        <span className="font-serif-display text-[13px] text-[var(--timer-parchment)]">
          {totalDays === 0 ? 'N/A' : `${displayDays} of ${totalDays} days remain`}
        </span>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full mt-2 w-48 p-3 bg-[var(--timer-dark)] border border-[var(--timer-amethyst)] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-lg">
        <p className="font-serif-display italic text-[var(--timer-parchment)] text-xs text-center leading-relaxed">
          The circle weakens when the work is late. Honor your coven.
        </p>
      </div>
    </div>
  );
}