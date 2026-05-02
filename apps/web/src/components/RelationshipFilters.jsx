import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Filter, RotateCcw, CheckSquare, Square } from 'lucide-react';

const RELATIONSHIP_TYPES = [
  { id: 'ally', label: 'Ally', color: 'hsl(var(--rel-ally))' },
  { id: 'rival', label: 'Rival', color: 'hsl(var(--rel-rival))' },
  { id: 'family', label: 'Family', color: 'hsl(var(--rel-family))' },
  { id: 'romantic', label: 'Love Interest', color: 'hsl(var(--rel-love))' },
  { id: 'enemy', label: 'Enemy', color: 'hsl(var(--rel-enemy))' },
  { id: 'mentor', label: 'Mentor/Student', color: 'hsl(var(--rel-mentor))' },
  { id: 'other', label: 'Other', color: 'hsl(var(--rel-other))' }
];

const RelationshipFilters = ({ filters, setFilters, characters }) => {
  
  const handleTypeToggle = (typeId) => {
    setFilters(prev => {
      const types = prev.types.includes(typeId)
        ? prev.types.filter(t => t !== typeId)
        : [...prev.types, typeId];
      return { ...prev, types };
    });
  };

  const handleCharToggle = (charId) => {
    setFilters(prev => {
      const hiddenChars = prev.hiddenChars.includes(charId)
        ? prev.hiddenChars.filter(id => id !== charId)
        : [...prev.hiddenChars, charId];
      return { ...prev, hiddenChars };
    });
  };

  const resetFilters = () => {
    setFilters({
      types: RELATIONSHIP_TYPES.map(t => t.id),
      hiddenChars: []
    });
  };

  const selectAllTypes = () => {
    setFilters(prev => ({ ...prev, types: RELATIONSHIP_TYPES.map(t => t.id) }));
  };

  const clearAllTypes = () => {
    setFilters(prev => ({ ...prev, types: [] }));
  };

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Relationship Types</h4>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={selectAllTypes} title="Select All"><CheckSquare className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAllTypes} title="Clear All"><Square className="h-3 w-3" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              {RELATIONSHIP_TYPES.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type.id}`} 
                    checked={filters.types.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                  />
                  <Label 
                    htmlFor={`type-${type.id}`}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Characters</h4>
            <div className="space-y-2">
              {characters.map(char => (
                <div key={char.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`char-${char.id}`} 
                    checked={!filters.hiddenChars.includes(char.id)}
                    onCheckedChange={() => handleCharToggle(char.id)}
                  />
                  <Label 
                    htmlFor={`char-${char.id}`}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 line-clamp-1"
                  >
                    {char.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default RelationshipFilters;