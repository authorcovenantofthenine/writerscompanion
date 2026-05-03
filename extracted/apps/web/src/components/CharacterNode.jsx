import React from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

export default function CharacterNode({ character, isSelected, onClick, colorClass = 'char-gold' }) {
  const imageUrl = character.portrait 
    ? pb.files.getUrl(character, character.portrait)
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${character.id}&backgroundColor=1a1a1a`;

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer transition-all duration-300",
        isSelected ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
      )}
      onClick={() => onClick(character.id)}
    >
      <div className={cn(
        "w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300",
        isSelected ? `neon-glow-${colorClass.replace('char-', '')}` : "border-border"
      )}>
        <img src={imageUrl} alt={character.name} className="w-full h-full object-cover" />
      </div>
      <span className={cn(
        "text-xs font-serif font-medium text-center max-w-[80px] truncate",
        isSelected ? `text-glow-${colorClass.replace('char-', '')}` : "text-muted-foreground"
      )}>
        {character.name}
      </span>
    </div>
  );
}