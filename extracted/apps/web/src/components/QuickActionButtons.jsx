import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, PenTool, MessageSquare, Sparkles } from 'lucide-react';

const QuickActionButtons = ({ onActionClick }) => {
  const actions = [
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      icon: Lightbulb,
      template: 'Brainstorm: A [genre] story about [theme]'
    },
    {
      id: 'improve',
      label: 'Improve',
      icon: PenTool,
      template: 'Improve: [Paste your text here]'
    },
    {
      id: 'dialogue',
      label: 'Dialogue',
      icon: MessageSquare,
      template: 'Dialogue: [Character A] and [Character B] discussing [topic]'
    },
    {
      id: 'expand',
      label: 'Expand',
      icon: Sparkles,
      template: 'Expand: [Paste your text here]'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-background/50 hover:bg-primary/10 hover:text-primary border-muted transition-colors rounded-full px-3"
            onClick={() => onActionClick(action.template)}
          >
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActionButtons;