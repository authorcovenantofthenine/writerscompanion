import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TierCard = ({ tier, isSelected, onClick }) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 relative overflow-hidden h-full flex flex-col text-left",
        isSelected 
          ? "border-primary ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]" 
          : "hover:border-primary/50 hover:bg-muted/50 border-border bg-card/80 backdrop-blur-sm"
      )}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" /> Selected
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-bold">{tier.price}</span>
          <span className="text-muted-foreground text-sm">{tier.billingPeriod}</span>
        </div>
        <CardDescription className="mt-2 text-sm">{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <ul className="space-y-2.5 text-sm mt-4 border-t border-border/50 pt-4">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TierCard;