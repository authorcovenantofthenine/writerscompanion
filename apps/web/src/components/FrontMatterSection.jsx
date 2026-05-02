import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FrontMatterSection = ({ item, index, isActive, onSelect, onDelete }) => {
  const formatType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group flex items-center gap-2 p-2 rounded-md border transition-colors mb-2",
            isActive 
              ? "bg-primary/10 border-primary/30 text-primary" 
              : "bg-card border-border/50 text-foreground hover:border-primary/30",
            snapshot.isDragging ? "shadow-lg ring-1 ring-primary/50" : ""
          )}
        >
          <div 
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <button 
            className="flex-1 flex items-center gap-2 text-left overflow-hidden"
            onClick={() => onSelect(item.id)}
          >
            <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{item.title || formatType(item.sectionType)}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{formatType(item.sectionType)}</span>
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </Draggable>
  );
};

export default FrontMatterSection;