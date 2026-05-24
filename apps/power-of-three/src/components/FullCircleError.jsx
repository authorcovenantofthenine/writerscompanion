import React from 'react';
import { Link } from 'react-router-dom';

export default function FullCircleError({ circleName }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="parchment-scroll max-w-lg w-full flex flex-col items-center py-10 px-8 animate-fade-in-card">

        <div className="w-16 h-16 rounded-full border-2 border-[var(--gold-accent)] flex items-center justify-center mb-6 animate-fade-in-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[var(--gold-accent)]" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l14.14 14.14" />
          </svg>
        </div>

        <h2 className="text-3xl font-display text-[var(--gold-accent)] mb-3 animate-fade-in-text">
          The Circle Is Sealed
        </h2>

        {circleName && (
          <p className="font-serif-display italic text-[var(--parchment-text)]/80 text-lg mb-2 animate-fade-in-text">
            {circleName}
          </p>
        )}

        <p className="font-serif-body text-[var(--parchment-text)]/70 mb-8 leading-relaxed animate-fade-in-text">
          This circle already holds three. The power of three is complete — no more may enter this gathering.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-text">
          <Link
            to="/signup"
            className="copy-button px-8 py-3 text-base"
          >
            Start Your Own Circle
          </Link>
          <Link
            to="/"
            className="font-serif-display italic text-[var(--parchment-text)]/60 hover:text-[var(--gold-accent)] transition-colors text-base self-center"
          >
            Return Home
          </Link>
        </div>

      </div>
    </div>
  );
}
