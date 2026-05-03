import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

export default function TimelineEventModal({ isOpen, onClose, onSave, onDelete, event = null, chapters = [], characters = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    category: '',
    chapter_id: '',
    involved_characters: '',
    notes: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date || '',
        description: event.description || '',
        category: event.category || '',
        chapter_id: event.chapter_id || '',
        involved_characters: event.involved_characters || '',
        notes: event.notes || ''
      });
    } else {
      setFormData({ title: '', date: '', description: '', category: '', chapter_id: '', involved_characters: '', notes: '' });
    }
  }, [event, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-primary/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            {event ? 'Edit Event' : 'Add Event'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Event Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">Timestamp / Date</Label>
              <Input 
                id="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="bg-background text-foreground"
                placeholder="e.g. Battle, Birth, Discovery"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter_id" className="text-foreground">Chapter / Act</Label>
              <Select value={formData.chapter_id} onValueChange={(val) => setFormData({...formData, chapter_id: val})}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {chapters.map(ch => (
                    <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="involved_characters" className="text-foreground">Involved Characters (Comma separated IDs for now)</Label>
            <Input 
              id="involved_characters" 
              value={formData.involved_characters} 
              onChange={(e) => setFormData({...formData, involved_characters: e.target.value})} 
              className="bg-background text-foreground"
              placeholder="Character IDs..."
            />
            <p className="text-xs text-muted-foreground">Available: {characters.map(c => c.name).join(', ')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Private Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="bg-background text-foreground min-h-[60px]"
            />
          </div>

          <DialogFooter className="pt-4 flex justify-between sm:justify-between">
            {event && onDelete ? (
              <Button type="button" variant="destructive" onClick={() => { onDelete(event.id); onClose(); }}>
                Delete
              </Button>
            ) : <div></div>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {event ? 'Save Changes' : 'Add Event'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}