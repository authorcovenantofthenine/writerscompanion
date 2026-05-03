
import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import ChatMessage from './ChatMessage.jsx';
import RateLimitMessage from './RateLimitMessage.jsx';
import useAIRateLimit from '@/hooks/useAIRateLimit.js';

export default function AIChat({ chatHistory, onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { isRateLimited, checkError, clearRateLimit } = useAIRateLimit();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    setInput('');
    clearRateLimit();
    
    try {
      const result = onSendMessage(currentInput);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      if (checkError(error)) {
        setInput(currentInput); // Restore input so user doesn't lose it
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-md border border-primary/20 rounded-2xl overflow-hidden shadow-xl">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-70">
              <Wand2 className="w-12 h-12 text-primary/50 mb-4" />
              <p className="font-cormorant text-xl text-muted-foreground italic">
                The grimoire awaits your inquiry. Ask for guidance, critique, or inspiration.
              </p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <ChatMessage 
                key={idx} 
                message={{
                  ...msg,
                  id: idx.toString(),
                  role: msg.role === 'assistant' ? 'ai' : 'user'
                }} 
              />
            ))
          )}
          
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-card/40 border border-primary/10 rounded-2xl w-fit max-w-[80%] shadow-sm backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30 shrink-0">
                <Wand2 className="h-5 w-5 animate-pulse-glow" />
              </div>
              <div className="flex gap-1.5 px-2">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-primary/20">
        <div className="max-w-3xl mx-auto">
          <RateLimitMessage isVisible={isRateLimited} onDismiss={clearRateLimit} />
          
          <div className="relative flex items-end gap-2 bg-muted/30 border border-primary/20 rounded-xl p-2 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Seek guidance from Quil... (Shift+Enter for new line)"
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 p-2 text-base shadow-none text-foreground placeholder:text-muted-foreground/50 font-cormorant text-lg"
              rows={1}
              disabled={isRateLimited}
            />
            <Button 
              size="icon" 
              className="h-10 w-10 rounded-lg shrink-0 mb-1 mr-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95 shadow-md"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRateLimited}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center mt-3">
            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium tracking-wide">
              <Sparkles className="w-3 h-3 text-mystical-gold" />
              Quil provides mentor guidance, not direct manuscript rewrites unless requested.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
