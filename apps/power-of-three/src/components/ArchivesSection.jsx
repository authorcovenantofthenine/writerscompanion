import React, { useState } from 'react';
import ArchiveRoundCard from './ArchiveRoundCard.jsx';
import GrimoireExport from './GrimoireExport.jsx';

export default function ArchivesSection({ completedRounds, circleData }) {
  const [expandedRounds, setExpandedRounds] = useState(new Set());

  const handleToggleCard = (roundId) => {
    setExpandedRounds(prev => {
      const next = new Set(prev);
      if (next.has(roundId)) {
        next.delete(roundId);
      } else {
        next.add(roundId);
      }
      return next;
    });
  };

  if (!completedRounds || completedRounds.length === 0) {
    return (
      <section className="mt-16 text-center animate-fade-in">
        <h2 className="text-4xl font-display text-primary mb-3">The Archives</h2>
        <p className="text-lg font-serif-body italic text-foreground/70 mb-10">
          No completed rounds yet. Begin your journey.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
        <div className="text-center sm:text-left">
          <h2 className="text-4xl font-display text-primary mb-2">The Archives</h2>
          <p className="text-lg font-serif-body italic text-foreground/70">
            The completed cycles of your coven's work
          </p>
        </div>
        <GrimoireExport circleData={circleData} completedRounds={completedRounds} />
      </div>

      <div className="space-y-4">
        {completedRounds.map((round) => (
          <ArchiveRoundCard 
            key={round.id}
            roundData={round}
            isExpanded={expandedRounds.has(round.id)}
            onToggle={handleToggleCard}
          />
        ))}
      </div>
    </section>
  );
}