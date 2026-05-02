import React from 'react';
import { Feather } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { authorStyles } from '@/lib/authorStyles.js';

const AuthorStyleSelector = ({ selectedStyle, onSelect }) => {
  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-3">
        <Feather className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedStyle} onValueChange={onSelect}>
          <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm border-muted">
            <SelectValue placeholder="Select an author style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (Neutral AI)</SelectItem>
            {Object.entries(authorStyles).map(([key, style]) => (
              <SelectItem key={key} value={key}>{style.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStyle !== 'default' && authorStyles[selectedStyle] && (
        <Alert className="bg-[hsl(var(--chat-ai-bg))] border-[hsl(var(--chat-border))] py-2 px-3">
          <AlertTitle className="text-xs font-semibold mb-1">{authorStyles[selectedStyle].name} Style Active</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground space-y-1.5">
            <p>{authorStyles[selectedStyle].description}</p>
            <p className="italic border-l-2 border-primary/30 pl-2 py-0.5 text-foreground/70">
              "{authorStyles[selectedStyle].sample}"
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AuthorStyleSelector;