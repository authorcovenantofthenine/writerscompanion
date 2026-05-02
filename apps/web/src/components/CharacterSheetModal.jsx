import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave.js';

const CharacterSheetModal = ({ isOpen, onClose, character, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    appearance: ''
  });

  // Auto-save integration for inline editing
  useAutoSave('characters', character?.id, formData, 1500);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        role: character.role || '',
        description: character.description || '',
        appearance: character.appearance || ''
      });
    } else {
      setFormData({
        name: '',
        role: '',
        description: '',
        appearance: ''
      });
    }
  }, [character, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{character ? 'Edit Character' : 'Create Character'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Character Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                placeholder="e.g. Protagonist, Antagonist"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description & Personality</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={4} 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe their personality, background, and motivations..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appearance">Physical Appearance</Label>
            <Textarea 
              id="appearance" 
              name="appearance" 
              rows={3} 
              value={formData.appearance} 
              onChange={handleChange} 
              placeholder="Describe their physical traits, clothing, etc..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            {!character && (
              <Button type="submit" disabled={!formData.name.trim()}>
                Create Character
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSheetModal;