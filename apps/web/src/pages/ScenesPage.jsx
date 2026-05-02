import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Layers, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SceneForm from '@/components/SceneForm.jsx';

const ScenesPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState(null);

  const fetchScenes = async () => {
    if (!currentProject) {
      setScenes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const records = await pb.collection('scenes').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: 'order,created',
        $autoCancel: false,
      });
      setScenes(records);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      toast.error('Failed to load scenes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, [currentProject]);

  const handleOpenCreate = () => {
    setEditingScene(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (scene) => {
    setEditingScene(scene);
    setIsFormOpen(true);
  };

  // SceneForm now handles the API submission internally.
  // We just need to refresh the list and close the modal.
  const handleFormSubmitSuccess = async () => {
    await fetchScenes();
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scene?')) return;
    
    try {
      await pb.collection('scenes').delete(id, { $autoCancel: false });
      toast.success('Scene deleted');
      await fetchScenes();
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error('Failed to delete scene.');
    }
  };

  const handleReorder = async (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === scenes.length - 1)
    ) return;

    const newScenes = [...scenes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;
    
    // Update local state immediately for responsive UI
    setScenes(newScenes);

    try {
      // Update backend
      await Promise.all([
        pb.collection('scenes').update(newScenes[index].id, { order: index }, { $autoCancel: false }),
        pb.collection('scenes').update(newScenes[targetIndex].id, { order: targetIndex }, { $autoCancel: false })
      ]);
    } catch (error) {
      console.error('Error reordering scenes:', error);
      toast.error('Failed to save new order.');
      await fetchScenes(); // Revert on failure
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Layers className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select or create a project from the Projects page to manage scenes.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Scenes - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Link to="/app/chapters" className="hover:text-foreground transition-colors">Chapters</Link>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="font-medium text-foreground">Scenes</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Scenes</h1>
            <p className="text-muted-foreground mt-1">Outline and write scenes for {currentProject.name}</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Scene
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : scenes.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <Layers className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No scenes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start building your story by adding your first scene.
            </p>
            <Button onClick={handleOpenCreate}>Create Scene</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <Card key={scene.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      disabled={index === 0}
                      onClick={() => handleReorder(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      disabled={index === scenes.length - 1}
                      onClick={() => handleReorder(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{scene?.title || 'Untitled Scene'}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                      <span>{scene?.wordCount || 0} words</span>
                      <span>Updated {new Date(scene.updated).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(scene)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(scene.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <SceneForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleFormSubmitSuccess}
          initialData={editingScene}
        />
      </div>
    </AppLayout>
  );
};

export default ScenesPage;