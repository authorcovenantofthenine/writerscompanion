import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit2, Trash2, Network } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const RelationshipsPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [relationships, setRelationships] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRel, setEditingRel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    characterA_id: '',
    characterB_id: '',
    relationship_type: 'friend',
    dynamics: ''
  });

  const fetchData = async () => {
    if (!currentProject) {
      setRelationships([]);
      setCharacters([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [relRecords, charRecords] = await Promise.all([
        pb.collection('relationships').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: '-created',
          $autoCancel: false,
        }),
        pb.collection('characters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'name',
          $autoCancel: false,
        })
      ]);
      setRelationships(relRecords);
      setCharacters(charRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load relationships.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  const handleOpenCreate = () => {
    setEditingRel(null);
    setFormData({ characterA_id: '', characterB_id: '', relationship_type: 'friend', dynamics: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rel) => {
    setEditingRel(rel);
    setFormData({
      characterA_id: rel.characterA_id,
      characterB_id: rel.characterB_id,
      relationship_type: rel.relationship_type,
      dynamics: rel.dynamics
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.characterA_id === formData.characterB_id) {
      toast.error('Please select two different characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingRel) {
        await pb.collection('relationships').update(editingRel.id, formData, { $autoCancel: false });
        toast.success('Relationship updated');
      } else {
        await pb.collection('relationships').create({
          ...formData,
          projectId: currentProject.id,
          userId: currentUser.id,
        }, { $autoCancel: false });
        toast.success('Relationship created');
      }
      await fetchData();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving relationship:', error);
      toast.error('Failed to save relationship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this relationship?')) return;
    try {
      await pb.collection('relationships').delete(id, { $autoCancel: false });
      toast.success('Relationship deleted');
      await fetchData();
    } catch (error) {
      console.error('Error deleting relationship:', error);
      toast.error('Failed to delete relationship.');
    }
  };

  const getCharacterName = (id) => {
    const char = characters.find(c => c.id === id);
    return char ? char.name : 'Unknown Character';
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Network className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Relationships - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <PremiumFeatureGate
        featureName="Relationship Mapping"
        featureDescription="Relationship Mapping is a premium feature. Upgrade to unlock character relationship tracking."
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Relationships</h1>
              <p className="text-muted-foreground mt-1">Map connections between your characters.</p>
            </div>
            <Button onClick={handleOpenCreate} disabled={characters.length < 2}>
              <Plus className="mr-2 h-4 w-4" /> Add Relationship
            </Button>
          </div>

          {characters.length < 2 && !isLoading && (
            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              You need at least two characters in your project to create relationships. Go to the Characters page to add more.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : relationships.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
              <Network className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No relationships mapped</h3>
              <Button onClick={handleOpenCreate} disabled={characters.length < 2} className="mt-4">Create Relationship</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relationships.map((rel) => (
                <Card key={rel.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{getCharacterName(rel.characterA_id)}</span>
                          <span className="text-muted-foreground text-xs">↔</span>
                          <span className="font-semibold">{getCharacterName(rel.characterB_id)}</span>
                        </div>
                        <Badge variant="outline" className="w-fit capitalize">{rel.relationship_type}</Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(rel)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(rel.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{rel.dynamics || 'No dynamics described.'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingRel ? 'Edit Relationship' : 'Create Relationship'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Character A</Label>
                    <Select value={formData.characterA_id} onValueChange={v => setFormData({...formData, characterA_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {characters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Character B</Label>
                    <Select value={formData.characterB_id} onValueChange={v => setFormData({...formData, characterB_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {characters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Relationship Type</Label>
                  <Select value={formData.relationship_type} onValueChange={v => setFormData({...formData, relationship_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="enemy">Enemy</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="rival">Rival</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dynamics / Notes</Label>
                  <Textarea rows={3} value={formData.dynamics} onChange={e => setFormData({...formData, dynamics: e.target.value})} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !formData.characterA_id || !formData.characterB_id}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PremiumFeatureGate>
    </AppLayout>
  );
};

export default RelationshipsPage;