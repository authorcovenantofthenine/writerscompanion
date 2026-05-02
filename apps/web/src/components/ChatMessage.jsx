import React from 'react';
import { Wand2, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

const ChatMessage = ({ message, onApply }) => {
  const isAI = message.role === 'ai' || message.role === 'assistant';
  const isError = message.isError;

  // Parse simple markdown-like bolding and paragraphs
  const formatContent = (content) => {
    // Remove any wrapping quotes that might have slipped through
    const cleanContent = content.replace(/^["']|["']$/g, '').trim();
    
    return cleanContent.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;
      
      // Simple bold parsing (**text**)
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      
      return (
        <p key={idx} className="mb-3 last:mb-0 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="font-semibold text-mystical-gold/90">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={cn(
      "flex w-full gap-4 p-4 rounded-2xl transition-all duration-300",
      isAI 
        ? isError 
          ? "bg-destructive/5 border border-destructive/20" 
          : "bg-card/40 border border-primary/10 shadow-sm backdrop-blur-sm"
        : "bg-transparent flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm",
        isAI 
          ? isError
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-primary/10 border-primary/30 text-primary"
          : "bg-secondary/10 border-secondary/30 text-secondary"
      )}>
        {isAI ? (
          <Wand2 className={cn("w-5 h-5", !isError && "animate-pulse-glow")} />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        !isAI && "items-end"
      )}>
        <div className={cn(
          "flex items-center gap-2 text-xs font-medium tracking-wider uppercase",
          isAI ? "text-primary/70" : "text-secondary/70"
        )}>
          {isAI ? 'Quil' : 'You'}
          {isAI && !isError && <Sparkles className="w-3 h-3 text-mystical-gold" />}
        </div>
        
        <div className={cn(
          "text-sm sm:text-base",
          isAI 
            ? "font-cormorant text-foreground/90 text-lg" 
            : "text-foreground/80 bg-secondary/5 px-4 py-3 rounded-2xl rounded-tr-sm border border-secondary/10"
        )}>
          {formatContent(message.content)}
        </div>

        {/* Actions */}
        {isAI && !isError && onApply && (
          <div className="mt-2 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onApply(message.content)}
              className="h-8 text-xs bg-primary/5 hover:bg-primary/15 border-primary/20 text-primary transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Apply to Manuscript
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;