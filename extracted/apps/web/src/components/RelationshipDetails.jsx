import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Edit2, Trash2, X } from 'lucide-react';

const RelationshipDetails = ({ isOpen, onClose, relationship, allCharacters, onEdit, onDelete }) => {
  if (!relationship) return null;

  const charA = allCharacters.find(c => c.id === relationship.characterA_id);
  const charB = allCharacters.find(c => c.id === relationship.characterB_id);

  if (!charA || !charB) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary flex items-center justify-center gap-4">
            <span>{charA.name}</span>
            <span className="text-muted-foreground text-sm font-sans">&</span>
            <span>{charB.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 text-center">
          <div>
            <Badge variant="outline" className="px-4 py-1 text-sm capitalize border-primary/50 text-primary">
              {relationship.relationship_type}
            </Badge>
          </div>

          {relationship.dynamics ? (
            <div className="bg-background/50 p-4 rounded-lg border border-border/50 text-left">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dynamics</h4>
              <p className="text-sm leading-relaxed">{relationship.dynamics}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No dynamics described.</p>
          )}
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t border-border/50">
          <Button variant="destructive" size="sm" onClick={() => onDelete(relationship.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
            <Button size="sm" onClick={() => onEdit(relationship)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipDetails;