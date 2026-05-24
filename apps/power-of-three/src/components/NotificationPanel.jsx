import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function NotificationPanel({ notifications, onMarkAsRead, onClose }) {
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-panel-container')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="notification-panel-container absolute top-full right-0 mt-3 w-80 max-h-[400px] overflow-y-auto toast-parchment z-50 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="sticky top-0 bg-[var(--notify-parchment)] border-b border-[var(--notify-amethyst)]/30 px-4 py-3 flex justify-between items-center z-10">
        <h3 className="font-display text-lg text-[var(--notify-dark)] m-0">The Whispers</h3>
        <span className="text-xs font-serif-display italic text-[var(--notify-dark)]/60">
          {notifications.length} unread
        </span>
      </div>
      
      <div className="p-2 flex flex-col gap-1">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-[var(--notify-dark)]/60 font-serif-display italic">
            The air is still. No new whispers.
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="p-3 rounded hover:bg-[var(--notify-amethyst)]/5 transition-colors flex gap-3 items-start group cursor-pointer"
              onClick={() => onMarkAsRead(notif.id)}
            >
              <div className="flex-1">
                <p className="text-sm font-serif-body text-[var(--notify-dark)] leading-snug mb-1">
                  {notif.message}
                </p>
                <span className="text-[10px] font-serif-display uppercase tracking-wider text-[var(--notify-dark)]/50">
                  {formatTime(notif.created)}
                </span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 text-[var(--notify-amethyst)] hover:text-[var(--notify-gold)] transition-all"
                aria-label="Mark as read"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notif.id);
                }}
              >
                <CheckCircle2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}