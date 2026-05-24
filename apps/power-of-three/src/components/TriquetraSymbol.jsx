import React from 'react';

export default function TriquetraSymbol({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`triquetra-transition ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="50" cy="35" r="22" />
      <circle cx="38" cy="62" r="22" />
      <circle cx="62" cy="62" r="22" />
    </svg>
  );
}
