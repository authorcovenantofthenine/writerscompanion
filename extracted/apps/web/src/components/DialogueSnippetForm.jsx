import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProjectContext } from '@/hooks/useProjectContext.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const DialogueSnippetForm = ({ onSuccess, onCancel }) => {
  const { activeProject } = useProjectContext();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    characterName: '',
    context: '',
    dialogueText: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      toast.error('Please select a project first');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('dialogue_snippets').create({
        ...formData,
        projectId: activeProject.id,
        userId: currentUser.id
      }, { $autoCancel: false });
      
      toast.success('Dialogue snippet saved');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error('Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="characterName">Character Name</Label>
        <Input 
          id="characterName"
          value={formData.characterName}
          onChange={(e) => setFormData({...formData, characterName: e.target.value})}
          placeholder="e.g. Gandalf"
          required
          className="bg-background text-foreground"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="context">Context / Scene Setting</Label>
        <Input 
          id="context"
          value={formData.context}
          onChange={(e) => setFormData({...formData, context: e.target.value})}
          placeholder="e.g. At the gates of Moria"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dialogueText">Dialogue</Label>
        <Textarea 
          id="dialogueText"
          value={formData.dialogueText}
          onChange={(e) => setFormData({...formData, dialogueText: e.target.value})}
          placeholder='"You shall not pass!"'
          required
          className="min-h-[100px] bg-background text-foreground"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Snippet
        </Button>
      </div>
    </form>
  );
};

export default DialogueSnippetForm;