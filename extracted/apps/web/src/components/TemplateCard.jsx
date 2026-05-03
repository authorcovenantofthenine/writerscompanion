import React from 'react';
import { Check, LayoutTemplate, FileText, BookOpen, MonitorSmartphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import TemplatePreview from './TemplatePreview.jsx';

const TemplateCard = ({ template, onUseTemplate }) => {
  const getCategoryIcon = () => {
    switch (template.category) {
      case 'manuscript': return <FileText className="w-3.5 h-3.5" />;
      case 'print': return <BookOpen className="w-3.5 h-3.5" />;
      case 'digital': return <MonitorSmartphone className="w-3.5 h-3.5" />;
      default: return <LayoutTemplate className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="h-48 border-b border-border/50 bg-muted/10 relative shrink-0">
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-muted-foreground text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1 z-10 border border-border/50">
          <Lock className="w-3 h-3" /> Read-only Blueprint
        </div>
        <TemplatePreview template={template} />
      </div>
      
      <div className="p-5 flex flex-col flex-1 overflow-hidden">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-foreground leading-tight">{template.name}</h3>
          <Badge variant="secondary" className="flex items-center gap-1 ml-2 shrink-0">
            {getCategoryIcon()}
            <span className="capitalize">{template.category}</span>
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 shrink-0">
          {template.description}
        </p>
        
        <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Key Specifications</h4>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="bg-background/50 text-[10px]">{template.specifications.pageSize}</Badge>
                <Badge variant="outline" className="bg-background/50 text-[10px]">{template.specifications.dpi}</Badge>
                <Badge variant="outline" className="bg-background/50 text-[10px]">{template.specifications.font}</Badge>
                {template.hasBleed && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">Bleed Required</Badge>}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">File Requirements</h4>
              <ul className="space-y-1.5">
                {template.fileRequirements.map((req, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-snug">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
        
        <div className="mt-auto pt-4 border-t border-border/50 shrink-0">
          <Button 
            onClick={() => onUseTemplate(template)} 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Create Manuscript
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;