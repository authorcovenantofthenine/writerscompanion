import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { RefreshCw } from 'lucide-react';

export const RELATIONSHIP_TYPES = [
  { id: 'friend', label: 'Allies', color: 'hsl(var(--color-allies))' },
  { id: 'romantic', label: 'Romances', color: 'hsl(var(--color-romances))' },
  { id: 'rival', label: 'Rivalries', color: 'hsl(var(--color-rivalries))' },
  { id: 'family', label: 'Family', color: 'hsl(var(--color-family))' },
  { id: 'enemy', label: 'Enemies', color: 'hsl(var(--color-enemies))' },
  { id: 'mentor', label: 'Mentor/Student', color: 'hsl(var(--color-mentor))' },
  { id: 'other', label: 'Acquaintances', color: 'hsl(var(--color-acquaintances))' }
];

const RelationshipLegend = ({ relationships, selectedTypes, onToggleType, onReset }) => {
  // Calculate counts for each type based on the current full dataset
  const counts = RELATIONSHIP_TYPES.reduce((acc, type) => {
    acc[type.id] = relationships.filter(r => r.relationship_type === type.id).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/30">
        <h3 className="font-serif font-bold text-lg tracking-wide">Legend & Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Show All
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {RELATIONSHIP_TYPES.map((type, index) => {
            const isSelected = selectedTypes.includes(type.id);
            const count = counts[type.id] || 0;
            
            return (
              <motion.div 
                key={type.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  isSelected ? 'bg-background/40' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={`filter-${type.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleType(type.id)}
                    className="border-muted-foreground/50 data-[state=checked]:bg-transparent data-[state=checked]:border-transparent"
                    style={{ 
                      backgroundColor: isSelected ? type.color : 'transparent',
                      borderColor: isSelected ? type.color : undefined
                    }}
                  />
                  <label 
                    htmlFor={`filter-${type.id}`}
                    className="text-sm font-medium cursor-pointer select-none flex items-center gap-2"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ 
                        backgroundColor: type.color,
                        boxShadow: `0 0 8px ${type.color}` 
                      }} 
                    />
                    {type.label}
                  </label>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RelationshipLegend;