import React from 'react';

export default function RoleTab({ role, icon, isActive, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] min-w-max shrink-0 whitespace-nowrap text-sm sm:text-lg font-display transition-all duration-300 border-b-2 ${
        isActive 
          ? 'border-primary text-primary' 
          : 'border-transparent text-foreground/60 hover:text-foreground/80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span>{icon}</span>
      <span>{role}</span>
    </button>
  );
}