import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const MagicalButton = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  asChild = false,
  children,
  subtext,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)]",
    outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)_inset,0_0_20px_hsl(var(--primary)/0.2)]",
    ghost: "bg-transparent text-foreground hover:text-primary hover:bg-primary/5",
  };

  const sizes = {
    default: "h-12 px-6 py-2 text-base",
    sm: "h-9 px-4 text-sm",
    lg: "h-14 px-8 text-lg",
    icon: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-full font-cinzel font-semibold transition-all duration-300 active:scale-[0.98] will-change-transform",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
      {subtext && (
        <span className="text-sm font-cormorant italic text-muted-foreground">
          {subtext}
        </span>
      )}
    </div>
  );
});

MagicalButton.displayName = "MagicalButton";

export default MagicalButton;