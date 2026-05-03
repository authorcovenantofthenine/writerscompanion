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

const CONNECTION_TYPES = [
  { value: 'trade_route', label: 'Trade Route' },
  { value: 'alliance', label: 'Alliance' },
  { value: 'conflict', label: 'Conflict/War' },
  { value: 'family_bond', label: 'Family/Dynasty Bond' },
  { value: 'other', label: 'Other' }
];

const ConnectionForm = ({ isOpen, onClose, connection, locations, worldId, onSaveSuccess }) => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    locationA_id: '',
    locationB_id: '',
    relationship_type: 'trade_route',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (connection) {
        setFormData({
          locationA_id: connection.locationA_id || '',
          locationB_id: connection.locationB_id || '',
          relationship_type: connection.relationship_type || 'trade_route',
          description: connection.description || ''
        });
      } else {
        setFormData({
          locationA_id: '',
          locationB_id: '',
          relationship_type: 'trade_route',
          description: ''
        });
      }
    }
  }, [isOpen, connection]);

  const handleSave = async () => {
    if (!formData.locationA_id || !formData.locationB_id) {
      toast.error('Please select both locations.');
      return;
    }
    if (formData.locationA_id === formData.locationB_id) {
      toast.error('A location cannot connect to itself.');
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

      if (connection?.id) {
        await pb.collection('location_connections').update(connection.id, payload, { $autoCancel: false });
        toast.success('Connection updated.');
      } else {
        await pb.collection('location_connections').create(payload, { $autoCancel: false });
        toast.success('Connection created.');
      }
      
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error('Failed to save connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">
            {connection ? 'Edit Connection' : 'New Connection'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location A</Label>
              <Select 
                value={formData.locationA_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, locationA_id: val }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location B</Label>
              <Select 
                value={formData.locationB_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, locationB_id: val }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Connection Type</Label>
            <Select 
              value={formData.relationship_type} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_type: val }))}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the nature of this connection..."
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

export default ConnectionForm;