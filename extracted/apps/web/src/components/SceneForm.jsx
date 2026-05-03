import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { toast } from 'sonner';
import { sanitizeScenePayload } from '@/hooks/useProjectContext.js';

export default function SceneForm({ isOpen, onClose, onSubmit, initialData = null, chapterId, isLoading = false }) {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    synopsis: '',
    pov_character: '',
    emotional_beat: '',
    status: 'draft',
    chapter_id: chapterId || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        content: initialData?.content || '',
        synopsis: initialData?.synopsis || '',
        pov_character: initialData?.pov_character || '',
        emotional_beat: initialData?.emotional_beat || '',
        status: initialData?.status || 'draft',
        chapter_id: initialData?.chapter_id || chapterId || ''
      });
    }
  }, [initialData, isOpen, chapterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pre-submit validation for required fields
    if (!formData.title?.trim()) {
      toast.error('Scene title is required.');
      return;
    }

    if (!formData.chapter_id) {
      toast.error('A scene must belong to a chapter.');
      return;
    }

    if (!currentProject?.id) {
      toast.error('No active project selected.');
      return;
    }

    if (!currentUser?.id) {
      toast.error('User authentication error.');
      return;
    }

    setIsSaving(true);
    try {
      const wordCount = formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0;

      const rawPayload = {
        title: formData.title.trim(),
        content: formData.content,
        synopsis: formData.synopsis,
        pov_character: formData.pov_character,
        emotional_beat: formData.emotional_beat,
        status: formData.status,
        chapter_id: formData.chapter_id,
        wordCount,
        projectId: currentProject.id,
        userId: currentUser.id,
        lastEdited: new Date().toISOString()
      };

      const sanitizedPayload = sanitizeScenePayload(rawPayload);

      if (initialData && initialData.id) {
        await pb.collection('scenes').update(initialData.id, sanitizedPayload, { $autoCancel: false });
        toast.success('Scene updated successfully');
      } else {
        await pb.collection('scenes').create(sanitizedPayload, { $autoCancel: false });
        toast.success('Scene created successfully');
      }

      if (typeof onSubmit === 'function') {
        onSubmit();
      }
      onClose();
    } catch (error) {
      console.error('Scene save failed:', error);
      console.error('Response data:', error?.response?.data);
      
      if (error?.status === 400) {
        toast.error(`Validation Error: ${error?.response?.message || 'Check console for details'}`);
      } else if (error?.status === 403) {
        toast.error("You don't have permission to update this scene. Contact the project owner if you need access.");
      } else {
        toast.error(error?.response?.message || 'Failed to save scene.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Scene' : 'Create New Scene'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Scene Title <span className="text-destructive">*</span></Label>
            <Input 
              id="title" 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g., The Meeting at the Inn"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pov_character">POV Character</Label>
              <Input 
                id="pov_character" 
                value={formData.pov_character} 
                onChange={e => setFormData({...formData, pov_character: e.target.value})} 
                placeholder="Who is the viewpoint character?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotional_beat">Emotional Beat</Label>
            <Input 
              id="emotional_beat" 
              value={formData.emotional_beat} 
              onChange={e => setFormData({...formData, emotional_beat: e.target.value})} 
              placeholder="e.g., Tension building to relief"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea 
              id="synopsis" 
              rows={2} 
              value={formData.synopsis} 
              onChange={e => setFormData({...formData, synopsis: e.target.value})} 
              placeholder="Brief summary of what happens in this scene..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Scene Content</Label>
            <Textarea 
              id="content" 
              rows={6} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              placeholder="Start writing your scene here..."
              className="font-serif resize-y"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving || isLoading}>Cancel</Button>
            <Button type="submit" disabled={isSaving || isLoading || !formData.title?.trim()}>
              {isSaving || isLoading ? 'Saving...' : 'Save Scene'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}