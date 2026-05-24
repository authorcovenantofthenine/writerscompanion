import React, { useMemo } from 'react';

export default function ParticleBackground() {
  const particles = useMemo(() => {
    // Generate 15 particles with random start states
    return Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 2 + 2; // 2 to 4px
      const left = Math.random() * 100; // 0 to 100vw
      const delay = Math.random() * 20; // 0 to 20s
      const duration = Math.random() * 7 + 10; // 10 to 17s
      const drift = (Math.random() - 0.5) * 60; // -30 to 30px
      const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      
      return { id: i, size, left, delay, duration, drift, opacity };
    });
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden particle-container hidden md:block"
      aria-hidden="true"
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-[#D4AF56] shadow-[0_0_8px_2px_rgba(212,175,86,0.6)]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}vw`,
            opacity: 0,
            animation: `particleFloat ${p.duration}s linear ${p.delay}s infinite`,
            '--drift': `${p.drift}px`,
            '--max-opacity': p.opacity,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
}