import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import CharacterSheetModal from '@/components/CharacterSheetModal.jsx';
import CharacterCard from '@/components/CharacterCard.jsx';

const CharactersPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCharacters = async (pageNum = 1, append = false) => {
    if (!currentProject) {
      setCharacters([]);
      setIsLoading(false);
      return;
    }

    try {
      if (!append) setIsLoading(true);
      
      // Optimized: Use pagination instead of getFullList
      const result = await pb.collection('characters').getList(pageNum, 24, {
        filter: `projectId = "${currentProject.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      
      if (append) {
        setCharacters(prev => [...prev, ...result.items]);
      } else {
        setCharacters(result.items);
      }
      
      setHasMore(result.page < result.totalPages);
      setPage(result.page);
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to load characters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters(1, false);
  }, [currentProject]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchCharacters(page + 1, true);
    }
  };

  const handleOpenCreate = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleSaveCharacter = async (payload) => {
    if (editingCharacter) {
      await pb.collection('characters').update(editingCharacter.id, payload, { $autoCancel: false });
      toast.success('Character updated successfully.');
    } else {
      await pb.collection('characters').create({
        ...payload,
        projectId: currentProject.id,
        userId: currentUser.id,
      }, { $autoCancel: false });
      toast.success('Character created successfully.');
    }
    await fetchCharacters(1, false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) return;
    
    try {
      await pb.collection('characters').delete(id, { $autoCancel: false });
      toast.success('Character deleted successfully.');
      await fetchCharacters(1, false);
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character.');
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select or create a project from the Projects page to manage characters.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Characters - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif text-gold-gradient">Dramatis Personae</h1>
            <p className="text-muted-foreground mt-1">Manage the cast of {currentProject.name}</p>
          </div>
          <Button onClick={handleOpenCreate} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create New Character
          </Button>
        </div>

        {isLoading && characters.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-full aspect-[2/3] rounded-sm overflow-hidden border-2 border-border/30 bg-card/20">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : characters.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed bg-card/30">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
            <CardTitle className="mb-2 text-2xl font-serif">The Stage is Empty</CardTitle>
            <CardDescription className="mb-6 max-w-sm text-base">
              Every great story needs a compelling cast. Start populating your world by adding your first character.
            </CardDescription>
            <Button onClick={handleOpenCreate} variant="outline" className="border-primary/50 hover:bg-primary/10">
              Create Character
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {characters.map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={character} 
                  onEdit={() => handleOpenEdit(character)} 
                  onDelete={() => handleDelete(character.id)}
                  onUpdate={() => fetchCharacters(1, false)}
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load More Characters'}
                </Button>
              </div>
            )}
          </>
        )}

        <CharacterSheetModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          character={editingCharacter}
          onSave={handleSaveCharacter}
        />
      </div>
    </AppLayout>
  );
};

export default CharactersPage;