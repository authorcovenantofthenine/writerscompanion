import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ArchiveRoundCard({ roundData, isExpanded, onToggle }) {
  const completedDate = roundData.completed_at 
    ? new Date(roundData.completed_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'Unknown Date';

  return (
    <div className="archives-card">
      {/* Header */}
      <button 
        className="w-full flex items-center justify-between outline-none group"
        onClick={() => onToggle(roundData.id)}
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col items-start text-left">
          <h3 className="font-display text-2xl archives-text transition-colors group-hover:brightness-110">
            Round {roundData.roundNumber}
          </h3>
          <span className="font-serif-display text-sm opacity-70 italic text-[#12091A]">
            Completed: {completedDate}
          </span>
        </div>
        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="archives-text" size={24} />
        </div>
      </button>

      {/* Collapsible Content */}
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-6 space-y-6">
            
            {/* The Circle */}
            <div>
              <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                The Circle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#12091A]">
                <div>
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60">Writer</span>
                  <span className="font-serif-body">{roundData.current_writer || 'Unknown'}</span>
                </div>
                <div>
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60">Beta Reader</span>
                  <span className="font-serif-body">{roundData.current_beta_reader || 'Unknown'}</span>
                </div>
                <div>
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60">Editor</span>
                  <span className="font-serif-body">{roundData.current_editor || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* The Work */}
            <div>
              <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                The Work
              </h4>
              <div className="mb-2 text-[#12091A]">
                <span className="font-display text-xl">{roundData.workTitle || 'Untitled'}</span>
                <span className="ml-3 font-serif-display text-sm italic opacity-70">
                  {roundData.wordCount || 0} words
                </span>
              </div>
              <div className="archives-scroll max-h-[300px] p-4 bg-white/20 rounded border border-[hsl(var(--archives-border))]/20 text-[#12091A] font-serif-body text-sm whitespace-pre-wrap leading-relaxed">
                {roundData.workSubmission || 'No work submitted.'}
              </div>
            </div>

            {/* The Calling */}
            {roundData.callingQuestions && (
              <div>
                <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                  The Calling
                </h4>
                <div className="p-3 bg-white/20 rounded border border-[hsl(var(--archives-border))]/20 text-[#12091A] font-serif-body text-sm italic">
                  {roundData.callingQuestions}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Beta Reader Feedback */}
              {roundData.betaFeedback && (
                <div className="space-y-4">
                  <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                    The Beta Reader's Reflection
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">What Resonated</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.betaFeedback.what_resonated}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">Where the Spell Faltered</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.betaFeedback.where_spell_faltered}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">Visions for the Writer</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.betaFeedback.visions_for_writer}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Feedback */}
              {roundData.editorFeedback && (
                <div className="space-y-4">
                  <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                    The Editor's Craft
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">The Sharpening</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.editorFeedback.the_sharpening}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">Structural Incantations</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.editorFeedback.structural_incantations}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-display text-sm archives-text opacity-90">The Final Blessing</h5>
                      <div className="archives-scroll max-h-[200px] text-[#12091A] font-serif-body text-sm bg-white/10 p-2 rounded">
                        {roundData.editorFeedback.the_final_blessing}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rituals */}
            <div>
              <h4 className="font-display text-lg archives-text mb-2 border-b border-[hsl(var(--archives-divider))]/30 pb-1">
                The Ritual
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-3 rounded">
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60 text-[#12091A] mb-1">The Hope</span>
                  <div className="archives-scroll max-h-[150px] text-[#12091A] font-serif-body text-sm italic">
                    {roundData.openingHope || 'No hope recorded.'}
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded">
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60 text-[#12091A] mb-1">The Lesson</span>
                  <div className="archives-scroll max-h-[150px] text-[#12091A] font-serif-body text-sm italic">
                    {roundData.closingLearned || 'No lesson recorded.'}
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded">
                  <span className="block font-serif-display text-xs uppercase tracking-widest opacity-60 text-[#12091A] mb-1">The Win</span>
                  <div className="archives-scroll max-h-[150px] text-[#12091A] font-serif-body text-sm italic">
                    {roundData.winCelebration || 'No win recorded.'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}