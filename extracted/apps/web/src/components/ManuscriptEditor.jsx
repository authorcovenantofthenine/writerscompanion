import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTemplates } from '@/hooks/useTemplates.js';
import { LayoutTemplate } from 'lucide-react';

const ManuscriptEditor = forwardRef(({ 
  content, 
  onChange, 
  onEditorReady,
  onStatsChange,
  onSelectionChange
}, ref) => {
  const isUpdatingRef = useRef(false);
  const { activeTemplate } = useTemplates();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        strike: true,
        bulletList: true,
        orderedList: true,
        blockquote: true,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] pb-32',
      },
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const html = editor.getHTML();
      const text = editor.getText();
      
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const characterCount = text.length;
      
      onChange(html);
      onStatsChange({ wordCount, characterCount });
      isUpdatingRef.current = false;
    },
    onSelectionUpdate: ({ editor }) => {
      // Expose selection state changes to parent components if needed
      if (onSelectionChange) {
        onSelectionChange({
          from: editor.state.selection.from,
          to: editor.state.selection.to,
          empty: editor.state.selection.empty,
        });
      }
    },
  });

  useImperativeHandle(ref, () => ({
    getHTML: () => {
      return editor ? editor.getHTML() : '';
    },
    getText: () => {
      return editor ? editor.getText() : '';
    },
    getEditorInstance: () => {
      return editor;
    }
  }));

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && content !== undefined && !isUpdatingRef.current) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  return (
    <div className="flex-1 overflow-y-auto editor-container relative bg-background">
      <div className="absolute top-4 right-8 z-10 flex items-center gap-2">
        {activeTemplate && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm text-xs text-muted-foreground">
            <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
            <span>{activeTemplate.name}</span>
          </div>
        )}
      </div>
      
      <div 
        className={`max-w-4xl mx-auto px-8 py-12 md:py-16 ${activeTemplate ? 'template-applied' : ''}`}
        style={activeTemplate ? activeTemplate.styles : {}}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

ManuscriptEditor.displayName = 'ManuscriptEditor';

export default ManuscriptEditor;