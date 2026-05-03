import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HomeButton = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate('/app/dashboard')}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-50 ${className}`}
            aria-label="Back to Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-medium">
          <p>Back to Dashboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HomeButton;