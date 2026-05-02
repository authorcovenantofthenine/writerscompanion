import React from 'react';
import { sampleManuscriptText } from '@/lib/manuscriptTemplates.js';

const TemplatePreview = ({ template }) => {
  if (!template) return null;

  return (
    <div className="w-full h-full bg-muted/20 rounded-md overflow-hidden flex flex-col relative">
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div 
          className="bg-white text-black shadow-md relative transition-all duration-300 rounded-sm"
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '280px',
            maxWidth: '200px',
            fontFamily: template.styles['--template-font-family'],
            fontSize: '6px',
            lineHeight: template.styles['--template-line-height'],
            textAlign: template.styles['--template-text-align'],
            padding: '12px',
            overflow: 'hidden',
          }}
        >
          <div className="opacity-80 relative z-10">
            {sampleManuscriptText.split('\n\n').map((paragraph, idx) => (
              <p 
                key={idx} 
                style={{
                  textIndent: template.styles['--template-text-indent'] !== '0' ? '8px' : '0',
                  marginBottom: template.styles['--template-paragraph-spacing'] !== '0' ? '6px' : '0'
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-background/90 border-t border-border/50 p-2 text-[10px] text-center text-muted-foreground truncate">
        {template.previewDescription}
      </div>
    </div>
  );
};

export default TemplatePreview;