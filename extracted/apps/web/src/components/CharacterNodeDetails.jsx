import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { UserPlus, Edit2, X } from 'lucide-react';

const CharacterNodeDetails = ({ isOpen, onClose, character, relationships, allCharacters, onAddRelationship, onEditCharacter }) => {
  if (!character) return null;

  const charRelationships = relationships.filter(
    r => r.characterA_id === character.id || r.characterB_id === character.id
  );

  const getOtherCharacterName = (rel) => {
    const otherId = rel.characterA_id === character.id ? rel.characterB_id : rel.characterA_id;
    const otherChar = allCharacters.find(c => c.id === otherId);
    return otherChar ? otherChar.name : 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="flex flex-row items-start justify-between pr-8">
          <div>
            <DialogTitle className="text-3xl font-serif text-primary mb-2">
              {character.name}
            </DialogTitle>
            {character.role && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                {character.role}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 mt-4">
          <div className="space-y-6">
            {character.appearance && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h4>
                <p className="text-sm leading-relaxed">{character.appearance}</p>
              </div>
            )}
            
            {character.description && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
                <p className="text-sm leading-relaxed">{character.description}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Relationships</h4>
                <Button variant="outline" size="sm" onClick={() => onAddRelationship(character)} className="h-8">
                  <UserPlus className="h-3 w-3 mr-2" /> Add
                </Button>
              </div>
              
              {charRelationships.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No relationships defined yet.</p>
              ) : (
                <div className="space-y-2">
                  {charRelationships.map(rel => (
                    <div key={rel.id} className="p-3 rounded-lg bg-background/50 border border-border/50 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{getOtherCharacterName(rel)}</span>
                        <Badge variant="outline" className="text-xs capitalize">{rel.relationship_type}</Badge>
                      </div>
                      {rel.dynamics && (
                        <p className="text-xs text-muted-foreground mt-1">{rel.dynamics}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
          <Button onClick={() => onEditCharacter(character)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit Character
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterNodeDetails;