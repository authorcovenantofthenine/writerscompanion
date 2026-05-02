import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Network, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import RelationsNetworkVisualization from '@/components/RelationsNetworkVisualization.jsx';
import RelationshipLegend, { RELATIONSHIP_TYPES } from '@/components/RelationshipLegend.jsx';
import CharacterFilter from '@/components/CharacterFilter.jsx';
import CharacterNodeDetails from '@/components/CharacterNodeDetails.jsx';
import RelationshipDetails from '@/components/RelationshipDetails.jsx';
import RelationshipForm from '@/components/RelationshipForm.jsx';

const RelationsNetworkPage = () => {
  const { currentProject } = useProject();
  
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Filter States
  const [selectedTypes, setSelectedTypes] = useState(RELATIONSHIP_TYPES.map(t => t.id));
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Modals state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [isRelFormOpen, setIsRelFormOpen] = useState(false);
  const [editingRel, setEditingRel] = useState(null);

  const fetchData = async () => {
    if (!currentProject) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const [charsRes, relsRes] = await Promise.all([
        pb.collection('characters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          $autoCancel: false
        }),
        pb.collection('relationships').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          $autoCancel: false
        })
      ]);

      setCharacters(charsRes);
      setRelationships(relsRes);
    } catch (err) {
      console.error('Error fetching network data:', err);
      setError('Failed to load network data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  // Filter logic
  const { filteredCharacters, filteredRelationships } = useMemo(() => {
    let rels = relationships;

    // 1. Filter by selected character (direct connections only)
    if (selectedCharacter) {
      rels = rels.filter(r => r.characterA_id === selectedCharacter || r.characterB_id === selectedCharacter);
    }

    // 2. Filter by selected relationship types
    rels = rels.filter(r => selectedTypes.includes(r.relationship_type));

    // 3. Filter characters to only those present in the filtered relationships
    // (Plus the selected character itself, so it doesn't disappear if it has no matching connections)
    const connectedCharIds = new Set();
    rels.forEach(r => {
      connectedCharIds.add(r.characterA_id);
      connectedCharIds.add(r.characterB_id);
    });
    
    if (selectedCharacter) {
      connectedCharIds.add(selectedCharacter);
    }

    const chars = selectedCharacter || selectedTypes.length < RELATIONSHIP_TYPES.length
      ? characters.filter(c => connectedCharIds.has(c.id))
      : characters;

    return { filteredCharacters: chars, filteredRelationships: rels };
  }, [characters, relationships, selectedCharacter, selectedTypes]);

  const handleToggleType = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleResetFilters = () => {
    setSelectedTypes(RELATIONSHIP_TYPES.map(t => t.id));
    setSelectedCharacter(null);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleLinkClick = (link) => {
    setSelectedLink(link);
  };

  const handleAddRelationship = (character = null) => {
    setEditingRel(character ? { characterA_id: character.id } : null);
    setIsRelFormOpen(true);
    setSelectedNode(null);
  };

  const handleEditRelationship = (rel) => {
    setEditingRel(rel);
    setIsRelFormOpen(true);
    setSelectedLink(null);
  };

  const handleDeleteRelationship = async (id) => {
    if (!window.confirm('Are you sure you want to delete this relationship?')) return;
    try {
      await pb.collection('relationships').delete(id, { $autoCancel: false });
      toast.success('Relationship deleted.');
      setSelectedLink(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting relationship:', err);
      toast.error('Failed to delete relationship.');
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Network className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select or create a project to view the relations network.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Relations Network - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-[1600px] mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-4">
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif">Web of Fates</h1>
            <p className="text-muted-foreground mt-1">Visualize cosmic connections between characters</p>
          </div>
          <div className="flex items-center gap-4">
            <CharacterFilter 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
            />
            <Button onClick={() => handleAddRelationship()} className="shadow-lg shadow-primary/20 h-11">
              <Plus className="mr-2 h-4 w-4" /> Add Connection
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-card/30 border border-destructive/30 rounded-xl">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">Retry</Button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex gap-6">
            <div className="flex-1">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="w-72 shrink-0">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        ) : characters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-card/30 border border-dashed border-border/50 rounded-xl text-center p-8">
            <Network className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-serif mb-2">No Characters Found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You need characters to build a network. Go to the Characters page to add some first.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            <div className="flex-1 h-full min-h-[400px] rounded-xl overflow-hidden border border-border/50 shadow-xl">
              <RelationsNetworkVisualization 
                characters={filteredCharacters}
                relationships={filteredRelationships}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
              />
            </div>
            <div className="w-full md:w-72 shrink-0 h-64 md:h-full">
              <RelationshipLegend 
                relationships={relationships} // Pass all relationships for accurate total counts
                selectedTypes={selectedTypes}
                onToggleType={handleToggleType}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        <CharacterNodeDetails 
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          character={selectedNode}
          relationships={relationships}
          allCharacters={characters}
          onAddRelationship={handleAddRelationship}
          onEditCharacter={() => {
            setSelectedNode(null);
            toast.info('Navigate to Characters page to edit full details.');
          }}
        />

        <RelationshipDetails 
          isOpen={!!selectedLink}
          onClose={() => setSelectedLink(null)}
          relationship={selectedLink}
          allCharacters={characters}
          onEdit={handleEditRelationship}
          onDelete={handleDeleteRelationship}
        />

        <RelationshipForm 
          isOpen={isRelFormOpen}
          onClose={() => setIsRelFormOpen(false)}
          relationship={editingRel}
          characters={characters}
          onSaveSuccess={fetchData}
        />
      </div>
    </AppLayout>
  );
};

export default RelationsNetworkPage;