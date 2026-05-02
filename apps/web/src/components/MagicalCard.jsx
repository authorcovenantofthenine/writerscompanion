import React from 'react';
import { cn } from '@/lib/utils';

const MagicalCard = React.forwardRef(({ className, children, hoverEffect = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 transition-all duration-500",
        hoverEffect && "hover:floating hover:glow-effect hover:border-primary/50 magical-border",
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
});

MagicalCard.displayName = 'MagicalCard';

export default MagicalCard;