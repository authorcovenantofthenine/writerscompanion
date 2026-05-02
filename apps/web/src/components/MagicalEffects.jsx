import React from 'react';

export default function MagicalEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-mystical-cyan/60 animate-floating-particles"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`
          }}
        />
      ))}
      
      {/* Candlelight Glows */}
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-mystical-gold/10 rounded-full blur-3xl animate-candlelight" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-mystical-gold/10 rounded-full blur-3xl animate-candlelight" style={{ animationDelay: '0.2s' }} />
      
      {/* Moon Glow */}
      <div className="absolute top-10 right-1/4 w-64 h-64 bg-mystical-cyan/5 rounded-full blur-3xl" />
    </div>
  );
}