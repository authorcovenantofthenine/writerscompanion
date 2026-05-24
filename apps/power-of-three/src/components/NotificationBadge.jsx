import React from 'react';

export default function NotificationBadge({ unreadCount, onClick }) {
  if (unreadCount <= 0) return null;

  return (
    <div className="relative group inline-flex items-center justify-center">
      <button
        onClick={onClick}
        className="w-6 h-6 rounded-full badge-glow animate-badge-pulse flex items-center justify-center cursor-pointer border border-[#F5EEDC]/30"
        aria-label="Unread notifications"
      >
        <span className="text-[#12091A] text-[10px] font-bold font-display">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-[var(--notify-dark)] border border-[var(--notify-amethyst)] rounded text-[var(--notify-parchment)] text-xs font-serif-display italic opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        You have unread notifications
      </div>
    </div>
  );
}