import React from 'react';

export default function MemberAvatars({ members = [], currentWriterIndex = 0 }) {
  // Ensure we always have exactly 3 slots for UI consistency
  const slots = [0, 1, 2].map(index => {
    return members[index] || { id: null, name: null, role: null };
  });

  return (
    <div className="flex items-center justify-center gap-4">
      {slots.map((member, index) => {
        const isCurrentWriter = index === currentWriterIndex;
        const isEmpty = !member.name;
        
        let containerClass = "member-avatar group";
        if (isEmpty) {
          containerClass += " awaiting";
        } else if (isCurrentWriter) {
          containerClass += " current-writer";
        } else {
          containerClass += " other-member";
        }

        const initial = isEmpty ? "?" : member.name.charAt(0).toUpperCase();

        return (
          <div key={index} className="relative flex flex-col items-center">
            <div className={containerClass}>
              {initial}
              
              {/* Tooltip */}
              <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <div className="bg-card border border-secondary/50 text-foreground text-xs px-3 py-1.5 rounded shadow-lg font-serif-body">
                  {isEmpty ? "Awaiting member..." : member.name}
                  {isCurrentWriter && <span className="text-primary italic ml-1">(Writer)</span>}
                </div>
              </div>
            </div>
            {/* Small decorative dot below current writer */}
            {isCurrentWriter && !isEmpty && (
              <div className="absolute -bottom-3 w-1.5 h-1.5 rotate-45 bg-primary"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}