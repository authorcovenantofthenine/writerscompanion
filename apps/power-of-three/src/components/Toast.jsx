import React, { useEffect, useState } from 'react';

const icons = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function Toast({ id, message, type = 'success', duration = 5000, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 400);
    const closeTimer = setTimeout(() => onClose(id), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [id, duration, onClose]);

  return (
    <div
      className={`pointer-events-auto toast-parchment flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg ${
        exiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <span className={type === 'error' ? 'text-red-600' : 'text-[var(--notify-gold)]'}>
        {icons[type] ?? icons.success}
      </span>
      <p className="font-serif-display text-[var(--notify-dark)] text-sm leading-snug flex-1">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="text-[var(--notify-dark)]/40 hover:text-[var(--notify-dark)] transition-colors flex-shrink-0 ml-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
