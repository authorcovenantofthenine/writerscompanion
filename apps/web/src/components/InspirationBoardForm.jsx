import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectContext } from '@/hooks/useProjectContext.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, Quote, Link as LinkIcon } from 'lucide-react';

const InspirationBoardForm = ({ onSuccess, onCancel }) => {
  const { activeProject } = useProjectContext();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    content: '',
    imageUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      toast.error('Please select a project first');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('inspiration_board').create({
        ...formData,
        projectId: activeProject.id,
        userId: currentUser.id
      }, { $autoCancel: false });
      
      toast.success('Inspiration added');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving inspiration:', error);
      toast.error('Failed to save inspiration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Cyberpunk Cityscape"
            required
            className="bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
            <SelectTrigger className="bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image"><div className="flex items-center"><ImageIcon className="w-4 h-4 mr-2"/> Image</div></SelectItem>
              <SelectItem value="quote"><div className="flex items-center"><Quote className="w-4 h-4 mr-2"/> Quote</div></SelectItem>
              <SelectItem value="reference"><div className="flex items-center"><LinkIcon className="w-4 h-4 mr-2"/> Reference</div></SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === 'image' && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input 
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            placeholder="https://example.com/image.jpg"
            className="bg-background text-foreground"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content">{formData.type === 'quote' ? 'Quote Text' : 'Description / Notes'}</Label>
        <Textarea 
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Add your notes here..."
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
          Add to Board
        </Button>
      </div>
    </form>
  );
};

export default InspirationBoardForm;