import React from 'react';

export default function RitualBox({ title, description, value, onChange, disabled, placeholder }) {
  return (
    <div className="border border-secondary/40 bg-card/30 rounded-xl p-4 sm:p-6 flex flex-col gap-3">
      <div>
        <h4 className="text-sm sm:text-base font-display text-primary italic mb-1">{title}</h4>
        <p className="text-xs sm:text-sm font-serif-body italic text-foreground/50">{description}</p>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full min-h-[100px] bg-transparent border-b border-secondary/40 text-sm text-foreground font-serif-body placeholder:text-foreground/30 focus:border-primary outline-none transition-all resize-none disabled:opacity-60 pt-1"
      />
    </div>
  );
}
