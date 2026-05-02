import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const RegionForm = ({ isOpen, onClose, region, worldId, onSaveSuccess }) => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4a5568'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (region) {
        setFormData({
          name: region.name || '',
          description: region.description || '',
          color: region.color || '#4a5568'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: '#4a5568'
        });
      }
    }
  }, [isOpen, region]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Region name is required.');
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

      if (region?.id) {
        await pb.collection('regions').update(region.id, payload, { $autoCancel: false });
        toast.success('Region updated.');
      } else {
        await pb.collection('regions').create(payload, { $autoCancel: false });
        toast.success('Region created.');
      }
      
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving region:', error);
      toast.error('Failed to save region.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">
            {region ? 'Edit Region' : 'New Region'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. The Whispering Vales"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the geography, climate, or general feel..."
              className="min-h-[100px] bg-background/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Map Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-16 h-10 p-1 bg-background/50 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">Used to tint the region on the map</span>
            </div>
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

export default RegionForm;