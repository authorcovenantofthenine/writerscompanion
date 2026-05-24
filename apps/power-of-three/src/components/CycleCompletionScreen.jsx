import React from 'react';

export default function CycleCompletionScreen({ circleName, members, onBeginNewCycle, onDissolveCircle }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in overflow-y-auto"
      style={{ backgroundColor: 'rgba(18, 9, 26, 0.95)' }}
    >
      <div className="max-w-3xl w-full border-2 border-[var(--amethyst)] rounded-xl p-10 md:p-16 bg-[var(--dark-overlay)] shadow-[0_0_50px_rgba(157,78,221,0.15)] text-center animate-scale-in my-auto">
        
        <h1 className="font-display text-4xl md:text-[64px] text-[var(--gold)] mb-4 leading-tight">
          The Cycle Is Complete
        </h1>
        
        <p className="font-serif-display text-xl md:text-[24px] italic text-[var(--parchment)] mb-8">
          Three voices have spoken. Three perspectives have shaped this work.
        </p>

        <div className="gold-divider my-8">
          <div className="gold-divider-line"></div>
          <div className="gold-divider-diamond"></div>
          <div className="gold-divider-line"></div>
        </div>

        <h2 className="font-display text-2xl md:text-[32px] text-[var(--gold)] mb-8">
          {circleName}
        </h2>

        <div className="space-y-4 mb-12 text-left max-w-xl mx-auto bg-black/20 p-8 rounded-lg border border-[var(--amethyst)]/30">
          {members && members.length === 3 && (
            <>
              <p className="font-serif-display text-lg text-[var(--parchment)]">
                <span className="text-[var(--gold)] font-display mr-2">Round 1:</span> 
                {members[0].name} wrote, {members[1].name} read, {members[2].name} edited
              </p>
              <p className="font-serif-display text-lg text-[var(--parchment)]">
                <span className="text-[var(--gold)] font-display mr-2">Round 2:</span> 
                {members[1].name} wrote, {members[2].name} read, {members[0].name} edited
              </p>
              <p className="font-serif-display text-lg text-[var(--parchment)]">
                <span className="text-[var(--gold)] font-display mr-2">Round 3:</span> 
                {members[2].name} wrote, {members[0].name} read, {members[1].name} edited
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <button 
            onClick={onBeginNewCycle}
            className="button-shimmer w-full sm:w-auto bg-[var(--gold)] text-[#12091A] font-display text-[18px] font-semibold py-3 px-8 rounded-lg hover:bg-[#e5c575] hover:-translate-y-1 transition-all shadow-[0_4px_15px_rgba(212,175,86,0.3)]"
          >
            Begin a New Cycle
          </button>
          
          <button 
            onClick={onDissolveCircle}
            className="hover:dissolve-button-glow w-full sm:w-auto bg-transparent border-2 border-[var(--amethyst)] text-[var(--amethyst)] font-display text-[18px] font-semibold py-3 px-8 rounded-lg hover:bg-[var(--amethyst)]/10 hover:text-[var(--red-ember)] hover:border-[var(--red-ember)] hover:-translate-y-1 transition-all"
          >
            Dissolve the Circle
          </button>
        </div>

      </div>
    </div>
  );
}