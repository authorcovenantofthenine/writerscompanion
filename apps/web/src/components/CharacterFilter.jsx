import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Users } from 'lucide-react';

const CharacterFilter = ({ characters, selectedCharacter, onSelectCharacter }) => {
  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-sm">
      <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
        <Users className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
          Focus Character
        </label>
        <Select 
          value={selectedCharacter || 'all'} 
          onValueChange={(val) => onSelectCharacter(val === 'all' ? null : val)}
        >
          <SelectTrigger className="h-9 bg-background/50 border-border/50">
            <SelectValue placeholder="Select a character..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-medium text-primary">
              All Characters (Full Network)
            </SelectItem>
            {characters.map(char => (
              <SelectItem key={char.id} value={char.id}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CharacterFilter;