import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Edit, Trash2, Eye, Sparkles, BookMarked, Lock } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const StoryArchitect = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const { canAccess } = useFeatureAccess();
  const canAccessAllBeatSheets = canAccess('beat_sheets');
  
  const [scenes, setScenes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBeatSheetGate, setShowBeatSheetGate] = useState(false);
  const [beatSheet, setBeatSheet] = useState('3act');
  const [editingScene, setEditingScene] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    pov_character: '',
    emotional_beat: '',
    status: 'draft'
  });

  useEffect(() => {
    if (currentProject) {
      fetchScenes();
    }
  }, [currentProject]);

  const fetchScenes = async () => {
    if (!currentProject) return;
    try {
      const records = await pb.collection('scenes').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: 'order',
        $autoCancel: false
      });
      setScenes(records);
    } catch (error) {
      console.error('Error fetching scenes:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScenes(items);

    try {
      await Promise.all(
        items.map((scene, index) =>
          pb.collection('scenes').update(scene.id, { order: index }, { $autoCancel: false })
        )
      );
      toast.success('Scene structure woven');
    } catch (error) {
      console.error('Error reordering scenes:', error);
      toast.error('Failed to reorder scenes');
      fetchScenes();
    }
  };

  const openDialog = (scene = null) => {
    if (scene) {
      setEditingScene(scene);
      setFormData({
        title: scene.title,
        synopsis: scene.synopsis || '',
        pov_character: scene.pov_character || '',
        emotional_beat: scene.emotional_beat || '',
        status: scene.status || 'draft'
      });
    } else {
      setEditingScene(null);
      setFormData({
        title: '',
        synopsis: '',
        pov_character: '',
        emotional_beat: '',
        status: 'draft'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentProject || !currentUser || !formData.title.trim()) {
      toast.error('Please provide a scene title');
      return;
    }

    try {
      const data = {
        ...formData,
        projectId: currentProject.id,
        userId: currentUser.id,
        order: editingScene ? editingScene.order : scenes.length,
        content: editingScene?.content || '',
        wordCount: editingScene?.wordCount || 0
      };

      if (editingScene) {
        await pb.collection('scenes').update(editingScene.id, data, { $autoCancel: false });
        toast.success('Scene enchantment updated');
      } else {
        await pb.collection('scenes').create(data, { $autoCancel: false });
        toast.success('New scene conjured');
      }

      setIsDialogOpen(false);
      await fetchScenes();
    } catch (error) {
      console.error('Error saving scene:', error);
      toast.error('Failed to save scene');
    }
  };

  const handleDelete = async (sceneId) => {
    try {
      await pb.collection('scenes').delete(sceneId, { $autoCancel: false });
      toast.success('Scene banished');
      await fetchScenes();
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error('Failed to delete scene');
    }
  };

  const handleBeatSheetChange = (val) => {
    if (val !== '3act' && !canAccessAllBeatSheets) {
      setShowBeatSheetGate(true);
      return;
    }
    setBeatSheet(val);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-success/20 text-success border-success/40 shadow-[0_0_8px_hsl(var(--success)/0.2)]';
      case 'in-progress':
        return 'bg-warning/20 text-warning border-warning/40 shadow-[0_0_8px_hsl(var(--warning)/0.2)]';
      default:
        return 'bg-background/50 text-accent/70 border-accent/20';
    }
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BookMarked className="h-20 w-20 text-accent/30 mb-6 flicker-candle" />
        <h2 className="text-3xl font-bold mb-3 text-accent text-glow">No Project Selected</h2>
        <p className="text-accent/70 text-lg">Select a project from the grimoire to weave your story structure</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -m-8 p-8">
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none"></div>

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-accent text-glow">
              <BookMarked className="h-8 w-8 text-warning flicker-candle" />
              Story Architect
            </h2>
            <p className="text-accent/70 mt-2 text-lg">Weave your narrative structure with enchanted scene cards</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={beatSheet} onValueChange={handleBeatSheetChange}>
              <SelectTrigger className="w-[220px] bg-background/60 border-accent/30 text-foreground">
                <SelectValue placeholder="Select Structure" />
              </SelectTrigger>
              <SelectContent className="bg-card border-accent/30">
                <SelectItem value="3act">3-Act Structure</SelectItem>
                <SelectItem value="savethecat" disabled={!canAccessAllBeatSheets}>
                  <div className="flex items-center justify-between w-full" title={!canAccessAllBeatSheets ? "Upgrade to Scribe" : ""}>
                    <span>Save the Cat</span>
                    {!canAccessAllBeatSheets && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                  </div>
                </SelectItem>
                <SelectItem value="herosjourney" disabled={!canAccessAllBeatSheets}>
                  <div className="flex items-center justify-between w-full" title={!canAccessAllBeatSheets ? "Upgrade to Scribe" : ""}>
                    <span>Hero's Journey</span>
                    {!canAccessAllBeatSheets && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                  </div>
                </SelectItem>
                <SelectItem value="storycircle" disabled={!canAccessAllBeatSheets}>
                  <div className="flex items-center justify-between w-full" title={!canAccessAllBeatSheets ? "Upgrade to Scribe" : ""}>
                    <span>Story Circle</span>
                    {!canAccessAllBeatSheets && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                  </div>
                </SelectItem>
                <SelectItem value="fichtean" disabled={!canAccessAllBeatSheets}>
                  <div className="flex items-center justify-between w-full" title={!canAccessAllBeatSheets ? "Upgrade to Scribe" : ""}>
                    <span>Fichtean Curve</span>
                    {!canAccessAllBeatSheets && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                  </div>
                </SelectItem>
                <SelectItem value="7point" disabled={!canAccessAllBeatSheets}>
                  <div className="flex items-center justify-between w-full" title={!canAccessAllBeatSheets ? "Upgrade to Scribe" : ""}>
                    <span>7-Point Structure</span>
                    {!canAccessAllBeatSheets && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openDialog()} className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground border border-success/30 shadow-[0_0_15px_hsl(var(--success)/0.2)]">
              <Plus className="h-4 w-4" />
              Conjure Scene
            </Button>
          </div>
        </div>

        {scenes.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-md border-accent/20 glow-soft">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <Eye className="h-20 w-20 text-accent/30 mb-6 shimmer-magic" />
              <h3 className="text-2xl font-semibold mb-3 text-accent">The canvas is blank</h3>
              <p className="text-accent/60 mb-8 text-lg">Begin weaving your story structure</p>
              <Button onClick={() => openDialog()} className="gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-success/20">
                <Plus className="h-4 w-4" />
                Conjure First Scene
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="scenes">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {scenes.map((scene, index) => (
                    <Draggable key={scene.id} draggableId={scene.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gradient-to-br from-card to-background border-accent/30 transition-all duration-300 ${
                            snapshot.isDragging ? 'glow-border scale-105 z-50 rotate-1' : 'glow-soft hover:border-accent/60 hover:-translate-y-1'
                          }`}
                        >
                          <CardHeader className="pb-3 border-b border-accent/10 bg-background/40">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent/10 rounded">
                                    <GripVertical className="h-4 w-4 text-accent/50" />
                                  </div>
                                  <Badge variant="outline" className={getStatusColor(scene.status)}>
                                    {scene.status}
                                  </Badge>
                                </div>
                                <CardTitle className="text-xl line-clamp-2 text-foreground font-serif tracking-wide">{scene.title}</CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4 relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full pointer-events-none"></div>
                            
                            {scene.synopsis && (
                              <p className="text-sm text-foreground/80 line-clamp-3 italic border-l-2 border-accent/30 pl-3">{scene.synopsis}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              {scene.pov_character && (
                                <div className="text-xs bg-background/50 p-2 rounded border border-accent/10">
                                  <span className="text-accent/70 block mb-1 uppercase tracking-wider text-[10px]">POV</span>
                                  <span className="text-foreground font-medium truncate block">{scene.pov_character}</span>
                                </div>
                              )}
                              {scene.emotional_beat && (
                                <div className="text-xs bg-background/50 p-2 rounded border border-accent/10">
                                  <span className="text-accent/70 block mb-1 uppercase tracking-wider text-[10px]">Beat</span>
                                  <span className="text-foreground font-medium truncate block">{scene.emotional_beat}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-accent/10">
                              <div className="text-xs text-accent/60 font-medium">
                                {scene.wordCount || 0} words
                              </div>
                              <div className="flex gap-1">
                                <Button onClick={() => openDialog(scene)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-accent/70 hover:text-accent hover:bg-accent/10">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDelete(scene.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-card border-accent/40 glow-border">
            <DialogHeader className="border-b border-accent/20 pb-4">
              <DialogTitle className="text-2xl text-accent text-glow flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-success" />
                {editingScene ? 'Edit Scene' : 'Conjure New Scene'}
              </DialogTitle>
              <DialogDescription className="text-accent/70">
                Weave the details of your scene into the story tapestry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-accent/90">Scene Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="The enchanted forest awakens..."
                  className="bg-background/60 border-accent/30 focus:border-accent focus:ring-accent/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis" className="text-accent/90">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  placeholder="What happens in this scene?"
                  className="min-h-[120px] bg-background/60 border-accent/30 focus:border-accent focus:ring-accent/30 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pov" className="text-accent/90">POV Character</Label>
                  <Input
                    id="pov"
                    value={formData.pov_character}
                    onChange={(e) => setFormData({ ...formData, pov_character: e.target.value })}
                    placeholder="Character name"
                    className="bg-background/60 border-accent/30 focus:border-accent focus:ring-accent/30 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-accent/90">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-background/60 border-accent/30 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-accent/30">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beat" className="text-accent/90">Emotional Beat</Label>
                <Input
                  id="beat"
                  value={formData.emotional_beat}
                  onChange={(e) => setFormData({ ...formData, emotional_beat: e.target.value })}
                  placeholder="Hope, despair, revelation..."
                  className="bg-background/60 border-accent/30 focus:border-accent focus:ring-accent/30 text-foreground"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-accent/20 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-accent/30 text-accent hover:bg-accent/10">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/80 text-primary-foreground border border-success/30 shadow-[0_0_10px_hsl(var(--success)/0.2)]">
                {editingScene ? 'Update Scene' : 'Conjure Scene'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBeatSheetGate} onOpenChange={setShowBeatSheetGate}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
            <PremiumFeatureGate
              forceLock={true}
              featureName="Advanced Beat Sheets"
              featureDescription="Advanced beat sheet structures are premium. Upgrade to Scribe or Archmage to access all 6 structures."
            >
              <div />
            </PremiumFeatureGate>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StoryArchitect;