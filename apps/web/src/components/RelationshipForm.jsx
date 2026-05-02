import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const RELATIONSHIP_TYPES = [
  { value: 'ally', label: 'Ally' },
  { value: 'rival', label: 'Rival' },
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Love Interest' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'mentor', label: 'Mentor/Student' },
  { value: 'other', label: 'Other' }
];

const RelationshipForm = ({ isOpen, onClose, relationship, characters, onSaveSuccess }) => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    characterA_id: '',
    characterB_id: '',
    relationship_type: 'other',
    dynamics: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (relationship) {
        setFormData({
          characterA_id: relationship.characterA_id || '',
          characterB_id: relationship.characterB_id || '',
          relationship_type: relationship.relationship_type || 'other',
          dynamics: relationship.dynamics || ''
        });
      } else {
        setFormData({
          characterA_id: '',
          characterB_id: '',
          relationship_type: 'other',
          dynamics: ''
        });
      }
    }
  }, [isOpen, relationship]);

  const handleSave = async () => {
    if (!formData.characterA_id || !formData.characterB_id) {
      toast.error('Please select both characters.');
      return;
    }
    if (formData.characterA_id === formData.characterB_id) {
      toast.error('A character cannot have a relationship with themselves.');
      return;
    }

    setIsSaving(true);
    try {
      // Check for existing relationship to prevent duplicates
      if (!relationship?.id) {
        const existing = await pb.collection('relationships').getFirstListItem(
          `projectId="${currentProject.id}" && ((characterA_id="${formData.characterA_id}" && characterB_id="${formData.characterB_id}") || (characterA_id="${formData.characterB_id}" && characterB_id="${formData.characterA_id}"))`,
          { $autoCancel: false }
        ).catch(() => null);

        if (existing) {
          toast.error('A relationship already exists between these characters.');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        projectId: currentProject.id,
        userId: currentUser.id
      };

      if (relationship?.id) {
        await pb.collection('relationships').update(relationship.id, payload, { $autoCancel: false });
        toast.success('Relationship updated.');
      } else {
        await pb.collection('relationships').create(payload, { $autoCancel: false });
        toast.success('Relationship created.');
      }
      
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving relationship:', error);
      toast.error('Failed to save relationship.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">
            {relationship ? 'Edit Relationship' : 'New Relationship'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Character A</Label>
              <Select 
                value={formData.characterA_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, characterA_id: val }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select character..." />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Character B</Label>
              <Select 
                value={formData.characterB_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, characterB_id: val }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select character..." />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select 
              value={formData.relationship_type} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_type: val }))}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dynamics & Description</Label>
            <Textarea 
              value={formData.dynamics}
              onChange={(e) => setFormData(prev => ({ ...prev, dynamics: e.target.value }))}
              placeholder="Describe how these characters interact..."
              className="min-h-[100px] bg-background/50 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipForm;