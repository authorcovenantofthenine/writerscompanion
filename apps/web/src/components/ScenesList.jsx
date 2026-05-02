import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, FileText, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import SceneForm from './SceneForm.jsx';

export default function ScenesList({ chapterId }) {
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState(null);

  const fetchScenes = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    try {
      // Optimized: Use getList with a reasonable limit instead of getFullList to prevent massive payloads
      const result = await pb.collection('scenes').getList(1, 100, {
        filter: `chapter_id = "${chapterId}"`,
        sort: 'order,created',
        $autoCancel: false
      });
      setScenes(result.items);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      toast.error('Failed to load scenes for this chapter.');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const handleOpenCreate = () => {
    setEditingScene(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (scene) => {
    setEditingScene(scene);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scene?')) return;
    try {
      await pb.collection('scenes').delete(id, { $autoCancel: false });
      toast.success('Scene deleted');
      fetchScenes();
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error('Failed to delete scene.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {scenes.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No scenes in this chapter yet.</p>
          <Button variant="outline" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add First Scene
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {scenes.map((scene) => (
            <Card key={scene.id} className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-center p-3 gap-4">
                  <div className="cursor-grab text-muted-foreground/40 hover:text-foreground transition-colors">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Safely access title, fallback to Untitled */}
                      <h4 className="font-medium text-foreground truncate">{scene?.title || 'Untitled Scene'}</h4>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(scene?.status)}`}>
                        {scene?.status || 'draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                      {scene?.pov_character && (
                        <span className="truncate max-w-[120px]">POV: {scene.pov_character}</span>
                      )}
                      <span>{scene?.wordCount || 0} words</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(scene)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(scene.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button variant="ghost" className="w-full border border-dashed border-border/60 text-muted-foreground hover:text-foreground" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Scene
          </Button>
        </div>
      )}

      <SceneForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={fetchScenes}
        initialData={editingScene}
        chapterId={chapterId}
      />
    </div>
  );
}