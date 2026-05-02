import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave.js';

const ProjectForm = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    tone: '',
    themes: ''
  });

  // Auto-save integration for inline editing
  useAutoSave('projects', initialData?.id, formData, 1500);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        genre: initialData.genre || '',
        tone: initialData.tone || '',
        themes: initialData.themes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        genre: '',
        tone: '',
        themes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. The Obsidian Crown"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description / Logline</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="A brief summary of your story..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input 
                id="genre" 
                name="genre" 
                value={formData.genre} 
                onChange={handleChange} 
                placeholder="e.g. High Fantasy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input 
                id="tone" 
                name="tone" 
                value={formData.tone} 
                onChange={handleChange} 
                placeholder="e.g. Dark, Epic"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="themes">Themes</Label>
            <Input 
              id="themes" 
              name="themes" 
              value={formData.themes} 
              onChange={handleChange} 
              placeholder="e.g. Betrayal, Redemption"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            {!initialData && (
              <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;