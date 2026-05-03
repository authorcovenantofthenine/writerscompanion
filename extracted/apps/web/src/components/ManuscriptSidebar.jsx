import React from 'react';
import { ChevronLeft, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ManuscriptSidebar = ({ 
  isOpen, 
  onToggle, 
  chaptersWithScenes, 
  currentSelection, 
  onSceneSelect
}) => {
  return (
    <div 
      className={cn(
        "sidebar-container border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isOpen ? "w-72" : "w-0 overflow-hidden border-r-0"
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
        <span className="font-semibold flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          Manuscript
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={onToggle}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30 shrink-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chapters</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {chaptersWithScenes.map((chapter) => (
              <div key={chapter.id} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  {chapter.chapter_number ? `Chapter ${chapter.chapter_number}` : chapter.title}
                </div>
                <div className="space-y-0.5">
                  {chapter.scenes?.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => onSceneSelect({ type: 'scene', id: scene.id })}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors",
                        currentSelection?.type === 'scene' && currentSelection.id === scene.id 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 opacity-70" />
                      <span className="truncate">{scene.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {chaptersWithScenes.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No scenes found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ManuscriptSidebar;