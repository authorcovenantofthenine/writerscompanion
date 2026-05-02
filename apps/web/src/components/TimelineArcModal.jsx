import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

export default function TimelineArcModal({ isOpen, onClose, onSave, arc = null }) {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  useEffect(() => {
    if (arc) {
      setFormData({
        name: arc.name || '',
        startTime: arc.startTime || '',
        endTime: arc.endTime || '',
        description: arc.description || ''
      });
    } else {
      setFormData({ name: '', startTime: '', endTime: '', description: '' });
    }
  }, [arc, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            {arc ? 'Edit Arc / Act' : 'Add Arc / Act'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Arc Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              className="bg-background text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground">Start Time</Label>
              <Input 
                id="startTime" 
                value={formData.startTime} 
                onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                className="bg-background text-foreground"
                placeholder="e.g. Year 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-foreground">End Time</Label>
              <Input 
                id="endTime" 
                value={formData.endTime} 
                onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                className="bg-background text-foreground"
                placeholder="e.g. Year 1005"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="bg-background text-foreground min-h-[100px]"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {arc ? 'Save Changes' : 'Add Arc'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}