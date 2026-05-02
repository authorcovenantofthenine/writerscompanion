import React, { useEffect, useState } from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Minus, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const ManuscriptToolbar = ({ 
  isOpen, 
  onToggle, 
  editor, 
  wordCount, 
  characterCount 
}) => {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strike: false,
    h1: false,
    h2: false,
    h3: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
  });

  useEffect(() => {
    if (!editor) return;

    const updateFormattingState = () => {
      setActiveFormats({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        strike: editor.isActive('strike'),
        h1: editor.isActive('heading', { level: 1 }),
        h2: editor.isActive('heading', { level: 2 }),
        h3: editor.isActive('heading', { level: 3 }),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        blockquote: editor.isActive('blockquote'),
      });
    };

    // Listen to both transaction and selectionUpdate for real-time feedback
    editor.on('transaction', updateFormattingState);
    editor.on('selectionUpdate', updateFormattingState);
    
    // Initial check
    updateFormattingState();

    return () => {
      editor.off('transaction', updateFormattingState);
      editor.off('selectionUpdate', updateFormattingState);
    };
  }, [editor]);

  const readingTime = Math.ceil((wordCount || 0) / 250) || 1;

  return (
    <div 
      className={cn(
        "toolbar-container border-l border-border/50 flex flex-col transition-all duration-300 ease-in-out shrink-0 bg-card/50 backdrop-blur-sm",
        isOpen ? "w-64" : "w-0 overflow-hidden border-l-0"
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onToggle}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-sm">Tools & Stats</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Formatting Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formatting</h4>
          <div className="flex flex-wrap gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.bold && "bg-primary/20 text-primary")}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.italic && "bg-primary/20 text-primary")}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.strike && "bg-primary/20 text-primary")}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8 mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.h1 && "bg-primary/20 text-primary")}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.h2 && "bg-primary/20 text-primary")}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.h3 && "bg-primary/20 text-primary")}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8 mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.bulletList && "bg-primary/20 text-primary")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.orderedList && "bg-primary/20 text-primary")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={cn("h-8 w-8 transition-colors", activeFormats.blockquote && "bg-primary/20 text-primary")}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Insert Elements */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Insert</h4>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!editor}
            className="w-full justify-start"
            onClick={() => editor?.chain().focus().insertContent('<p className="text-center my-8">***</p>').run()}
          >
            <Minus className="w-4 h-4 mr-2" />
            Scene Separator
          </Button>
        </div>

        <Separator />

        {/* Statistics */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="text-2xl font-semibold tabular-nums">{(wordCount || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground font-medium">Words</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="text-2xl font-semibold tabular-nums">{(characterCount || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground font-medium">Characters</div>
            </div>
            <div className="col-span-2 bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="text-lg font-medium tabular-nums">~{readingTime} min</div>
              <div className="text-xs text-muted-foreground font-medium">Estimated Reading Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptToolbar;