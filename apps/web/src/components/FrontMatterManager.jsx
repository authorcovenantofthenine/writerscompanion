import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FrontMatterSection from './FrontMatterSection.jsx';

const SECTION_TYPES = [
  { id: 'half_title', label: 'Half Title' },
  { id: 'title_page', label: 'Title Page' },
  { id: 'copyright', label: 'Copyright' },
  { id: 'dedication', label: 'Dedication' },
  { id: 'preface', label: 'Preface' },
  { id: 'acknowledgments', label: 'Acknowledgments' },
  { id: 'prologue', label: 'Prologue' },
  { id: 'introduction', label: 'Introduction' }
];

const FrontMatterManager = ({ 
  frontMatter, 
  onReorder, 
  onCreate, 
  onDelete, 
  currentSelectionId, 
  onSelect 
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(frontMatter);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  const handleCreateSection = (sectionTypeId) => {
    console.log('Requesting creation of new front matter section:', sectionTypeId);
    onCreate(sectionTypeId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/50 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Front Matter ({frontMatter.length})
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {SECTION_TYPES.map(type => (
              <DropdownMenuItem key={type.id} onClick={() => handleCreateSection(type.id)}>
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {frontMatter.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 opacity-20" />
            <p>No front matter sections.</p>
            <p className="text-xs">Add a title page or dedication to get started.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="front-matter-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  {frontMatter.map((item, index) => (
                    <FrontMatterSection
                      key={item.id}
                      item={item}
                      index={index}
                      isActive={currentSelectionId === item.id}
                      onSelect={onSelect}
                      onDelete={onDelete}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default FrontMatterManager;