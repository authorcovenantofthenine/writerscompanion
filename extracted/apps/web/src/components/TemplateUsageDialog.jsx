import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';

const TemplateUsageDialog = ({ isOpen, onClose, onConfirm, template }) => {
  const [manuscriptName, setManuscriptName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setManuscriptName('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = manuscriptName.trim();
    if (trimmedName.length < 3) {
      setError('Manuscript name must be at least 3 characters long.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      await onConfirm(template, trimmedName);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Create New Manuscript
          </DialogTitle>
          <DialogDescription>
            You are using the <strong>{template.name}</strong> template. Enter a name for your new manuscript document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="manuscriptName">Manuscript Name</Label>
            <Input
              id="manuscriptName"
              placeholder="e.g., The Final Chapter - Draft 1"
              value={manuscriptName}
              onChange={(e) => {
                setManuscriptName(e.target.value);
                if (error) setError('');
              }}
              disabled={isSubmitting}
              autoFocus
              className="text-foreground"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Template Specifications Applied:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Page Size: {template.specifications.pageSize}</li>
              <li>Font: {template.specifications.font}</li>
              <li>Margins: {template.specifications.margins}</li>
            </ul>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || manuscriptName.trim().length < 3}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Manuscript'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateUsageDialog;