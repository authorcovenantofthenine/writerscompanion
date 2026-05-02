import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, FolderOpen, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProjectForm from '@/components/ProjectForm.jsx';

const ProjectsPage = () => {
  const { currentUser } = useAuth();
  const { projects, refreshProjects, isLoading: contextLoading, setCurrentProject, currentProject } = useProject();
  const { canAccess } = useFeatureAccess();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLimitGate, setShowLimitGate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateMultiple = canAccess('projects_multiple');

  const handleOpenCreate = () => {
    if (!canCreateMultiple && projects.length >= 1) {
      setShowLimitGate(true);
      return;
    }
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await pb.collection('projects').update(editingProject.id, formData, { $autoCancel: false });
        toast.success('Project updated successfully');
      } else {
        const newProject = await pb.collection('projects').create({
          ...formData,
          userId: currentUser.id,
          wordCount: 0
        }, { $autoCancel: false });
        toast.success('Project created successfully');
        if (!currentProject) {
          setCurrentProject(newProject);
        }
      }
      await refreshProjects();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await pb.collection('projects').delete(id, { $autoCancel: false });
      toast.success('Project deleted');
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      await refreshProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project.');
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Projects - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gold-gradient">Your Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your writing projects and stories.</p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            title={!canCreateMultiple && projects.length >= 1 ? "Upgrade to Writer Plan to create unlimited projects" : ""}
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {contextLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <CardTitle className="mb-2">No projects yet</CardTitle>
            <CardDescription className="mb-6 max-w-sm">
              Create your first project to start building your world, characters, and scenes.
            </CardDescription>
            <Button onClick={handleOpenCreate}>Create New Project</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className={`flex flex-col transition-all duration-200 hover:shadow-md ${currentProject?.id === project.id ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(project)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 h-10">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                  <span>{project.wordCount || 0} words</span>
                  <span>Updated {new Date(project.updated).toLocaleDateString()}</span>
                </CardContent>
                <div className="px-6 pb-6 space-y-3">
                  <Button 
                    variant={currentProject?.id === project.id ? "secondary" : "outline"} 
                    className="w-full"
                    onClick={() => setCurrentProject(project)}
                  >
                    {currentProject?.id === project.id ? 'Active Project' : 'Set as Active'}
                  </Button>
                  
                  {currentProject?.id === project.id && (
                    <Button variant="default" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                      <Link to="/app/projects/books">
                        <BookOpen className="mr-2 h-4 w-4" /> Manage Books
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ProjectForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmit}
          initialData={editingProject}
          isLoading={isSubmitting}
        />

        <Dialog open={showLimitGate} onOpenChange={setShowLimitGate}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
            <PremiumFeatureGate
              forceLock={true}
              featureName="Project Limit Reached"
              featureDescription="Unlimited projects require an active Writer Plan subscription."
            >
              <div />
            </PremiumFeatureGate>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ProjectsPage;