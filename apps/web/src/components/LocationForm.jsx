import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const LOCATION_TYPES = [
  { value: 'city', label: 'City' },
  { value: 'village', label: 'Village' },
  { value: 'castle', label: 'Castle/Fortress' },
  { value: 'forest', label: 'Forest' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'island', label: 'Island' },
  { value: 'ruin', label: 'Ruin' },
  { value: 'temple', label: 'Temple' },
  { value: 'other', label: 'Other' }
];

const LocationForm = ({ isOpen, onClose, location, regions, worldId, defaultX = 0, defaultY = 0, onSaveSuccess }) => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'city',
    description: '',
    significance: '',
    regionId: '',
    x: defaultX,
    y: defaultY
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (location) {
        setFormData({
          name: location.name || '',
          type: location.type || 'city',
          description: location.description || '',
          significance: location.significance || '',
          regionId: location.regionId || '',
          x: location.x ?? defaultX,
          y: location.y ?? defaultY
        });
      } else {
        setFormData({
          name: '',
          type: 'city',
          description: '',
          significance: '',
          regionId: '',
          x: defaultX,
          y: defaultY
        });
      }
    }
  }, [isOpen, location, defaultX, defaultY]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        worldId,
        projectId: currentProject.id,
        userId: currentUser.id
      };

      if (location?.id) {
        await pb.collection('locations').update(location.id, payload, { $autoCancel: false });
        toast.success('Location updated.');
      } else {
        await pb.collection('locations').create(payload, { $autoCancel: false });
        toast.success('Location created.');
      }
      
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">
            {location ? 'Edit Location' : 'New Location'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Silverkeep"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Region (Optional)</Label>
            <Select 
              value={formData.regionId} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, regionId: val === 'none' ? '' : val }))}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select region..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {regions.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Physical description, atmosphere, notable features..."
              className="min-h-[80px] bg-background/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Significance</Label>
            <Textarea 
              value={formData.significance}
              onChange={(e) => setFormData(prev => ({ ...prev, significance: e.target.value }))}
              placeholder="Why is this place important to the story?"
              className="min-h-[80px] bg-background/50 resize-none"
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

export default LocationForm;