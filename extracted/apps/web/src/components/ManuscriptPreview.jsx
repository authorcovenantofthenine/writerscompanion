import React, { useMemo } from 'react';

const ManuscriptPreview = ({ chaptersWithScenes, settings, metadata, selectedScenes }) => {
  
  const options = useMemo(() => ({
    ...settings,
    includeScenes: selectedScenes,
    sceneSeparator: metadata?.sceneSeparator || '#',
    includeChapterHeadings: metadata?.includeChapterHeadings ?? true
  }), [settings, metadata, selectedScenes]);

  const compiledText = useMemo(() => {
    if (!chaptersWithScenes || chaptersWithScenes.length === 0) {
      return "No content found in this project. Start writing to preview your notes.\n";
    }

    let text = '';
    
    chaptersWithScenes.forEach((chapter, chapterIndex) => {
      const chapterScenes = chapter.scenes?.filter(scene => 
        !options.includeScenes || options.includeScenes.includes(scene.id)
      ) || [];

      if (chapterScenes.length === 0) return;

      if (chapterIndex > 0) {
        text += `\n\n---\n\n`;
      }

      if (chapter.id !== 'unassigned' && options.includeChapterHeadings) {
        text += `\n\n### Chapter ${chapter.chapter_number || ''}\n\n`;
        if (chapter.title) {
          text += `#### ${chapter.title}\n\n`;
        }
      }

      chapterScenes.forEach((scene, sceneIndex) => {
        if (scene.content) {
          text += scene.content + '\n\n';
        }
        
        if (sceneIndex < chapterScenes.length - 1 && options.sceneSeparator) {
          text += `\n${options.sceneSeparator}\n\n`;
        }
      });
    });
    
    return text;
  }, [chaptersWithScenes, options]);

  const wordCount = useMemo(() => {
    if (!compiledText) return 0;
    const cleanText = compiledText.replace(/<[^>]*>?/gm, '');
    return cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [compiledText]);

  // Format text for HTML display (handle page breaks and spacing)
  const renderFormattedText = () => {
    if (!compiledText) return null;
    
    const pages = compiledText.split('---PAGE BREAK---');
    
    return pages.map((page, pageIndex) => {
      // Check if page is a special HTML page (half-title or title-page)
      const isHtmlPage = page.includes('class="half-title-page"') || page.includes('class="title-page"');
      
      let content;
      if (isHtmlPage) {
        content = <div dangerouslySetInnerHTML={{ __html: page }} />;
      } else {
        const lines = page.split('\n');
        const formattedLines = lines.map((line, lineIndex) => {
          // Strip HTML tags from scene content for the preview if they exist
          const cleanLine = line.replace(/<[^>]*>?/gm, '');
          
          const isCentered = cleanLine.startsWith('                                ');
          const isChapterHeading = cleanLine.includes('CHAPTER') || (isCentered && cleanLine === cleanLine.toUpperCase() && cleanLine.trim().length > 3);
          
          if (isChapterHeading) {
            return <div key={lineIndex} className="font-bold text-lg">{cleanLine}</div>;
          }
          return <div key={lineIndex}>{cleanLine || ' '}</div>;
        });
        content = <div className="whitespace-pre-wrap break-words">{formattedLines}</div>;
      }

      return (
        <div key={pageIndex} className="mb-8 relative">
          {pageIndex > 0 && (
            <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
              <div className="h-px bg-border/50 w-full absolute"></div>
              <span className="bg-muted px-2 text-xs text-muted-foreground relative z-10">Page Break</span>
            </div>
          )}
          {content}
        </div>
      );
    });
  };

  const fontFamilyClass = settings?.fontFamily === 'Courier New' 
    ? 'font-mono' 
    : 'font-serif';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8 rounded-xl border border-border/50">
        <div 
          className={`bg-card text-card-foreground shadow-sm mx-auto max-w-3xl min-h-[1056px] p-8 md:p-16 ${fontFamilyClass}`}
          style={{ 
            lineHeight: '2',
            fontSize: '12pt'
          }}
        >
          {renderFormattedText()}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground px-2">
        <div>
          <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span> words
        </div>
        <div>
          Standard Preview Format
        </div>
      </div>
    </div>
  );
};

export default ManuscriptPreview;