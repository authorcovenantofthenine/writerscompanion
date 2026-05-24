import React from 'react';
import { Pencil } from 'lucide-react';

export default function FeedbackDisplay({ 
  roleName, 
  feedback, 
  fields, 
  onEdit, 
  canEdit 
}) {
  if (!feedback) return null;

  const date = new Date(feedback.created || feedback.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6 border-b border-secondary/30 pb-4">
        <div>
          <h3 className="text-2xl font-display text-primary italic mb-1">{roleName}</h3>
          <p className="font-serif-display text-sm text-foreground/50 uppercase tracking-widest">
            Submitted on {date}
          </p>
        </div>
        {canEdit && (
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="space-y-8">
        {fields.map((field, idx) => (
          <div key={idx} className="feedback-container">
            <h4 className="font-display text-lg text-primary mb-2">{field.label}</h4>
            <p className="font-serif-body text-sm text-foreground/60 italic mb-4">{field.description}</p>
            <div className="font-serif-body whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {feedback[field.key] || "No response provided."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}