import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import WorldBuilderSidebar from '@/components/WorldBuilderSidebar.jsx';
import WorldMap from '@/components/WorldMap.jsx';
import LocationDetails from '@/components/LocationDetails.jsx';
import LocationForm from '@/components/LocationForm.jsx';
import RegionForm from '@/components/RegionForm.jsx';
import ConnectionForm from '@/components/ConnectionForm.jsx';

const StoryArchitectPage = () => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  
  const [world, setWorld] = useState(null);
  const [locations, setLocations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [connections, setConnections] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({ search: '', type: 'all', region: 'all' });

  // Modal states
  const [isLocFormOpen, setIsLocFormOpen] = useState(false);
  const [isRegFormOpen, setIsRegFormOpen] = useState(false);
  const [isConnFormOpen, setIsConnFormOpen] = useState(false);
  
  const [editingLoc, setEditingLoc] = useState(null);
  const [editingReg, setEditingReg] = useState(null);
  const [editingConn, setEditingConn] = useState(null);
  
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });

  const fetchData = async () => {
    if (!currentProject) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Get or create world for this project
      let currentWorld;
      const worldsRes = await pb.collection('worlds').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        $autoCancel: false
      });

      if (worldsRes.length > 0) {
        currentWorld = worldsRes[0];
      } else {
        // Auto-create default world
        currentWorld = await pb.collection('worlds').create({
          name: `${currentProject.name} World`,
          description: 'The primary setting for this project.',
          projectId: currentProject.id,
          userId: currentUser.id
        }, { $autoCancel: false });
      }
      setWorld(currentWorld);

      // 2. Fetch all related data
      const [locsRes, regsRes, connsRes] = await Promise.all([
        pb.collection('locations').getFullList({ filter: `worldId = "${currentWorld.id}"`, $autoCancel: false }),
        pb.collection('regions').getFullList({ filter: `worldId = "${currentWorld.id}"`, $autoCancel: false }),
        pb.collection('location_connections').getFullList({ filter: `worldId = "${currentWorld.id}"`, $autoCancel: false })
      ]);

      setLocations(locsRes);
      setRegions(regsRes);
      setConnections(connsRes);
      
      // Update selected location if it was edited
      if (selectedLocation) {
        const updated = locsRes.find(l => l.id === selectedLocation.id);
        setSelectedLocation(updated || null);
      }

    } catch (err) {
      console.error('Error fetching world data:', err);
      setError('Failed to load world data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  const handleMapDoubleClick = (x, y) => {
    setClickCoords({ x, y });
    setEditingLoc(null);
    setIsLocFormOpen(true);
  };

  const handleAddLocation = () => {
    setClickCoords({ x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 });
    setEditingLoc(null);
    setIsLocFormOpen(true);
  };

  const handleEditLocation = (loc) => {
    setEditingLoc(loc);
    setIsLocFormOpen(true);
  };

  const handleAddRegion = () => {
    setEditingReg(null);
    setIsRegFormOpen(true);
  };

  const handleAddConnection = () => {
    setEditingConn(null);
    setIsConnFormOpen(true);
  };

  return (
    <AppLayout>
      <Helmet>
        <title>World Builder - {currentProject?.name || 'Quil Forge'}</title>
        <meta name="description" content="Build and explore your story worlds with locations, regions, and connections" />
      </Helmet>
      
      <PremiumFeatureGate 
        feature="world_builder" 
        featureName="World Builder"
        featureDescription="This feature requires an active Writer Plan subscription."
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-serif">World Builder</h1>
              <p className="text-muted-foreground mt-1">Build and explore your story worlds with locations, regions, and connections</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative -mx-8 -mb-8 border-t border-border bg-background">
            {!currentProject ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
                <p className="text-muted-foreground max-w-md">
                  Please select or create a project to access the World Builder.
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full bg-card/30 m-8 rounded-xl border border-destructive/30">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline">Retry</Button>
              </div>
            ) : isLoading ? (
              <div className="flex h-full m-8 gap-4">
                <Skeleton className="w-64 h-full rounded-xl" />
                <Skeleton className="flex-1 h-full rounded-xl" />
                <Skeleton className="w-80 h-full rounded-xl" />
              </div>
            ) : (
              <div className="flex w-full h-full overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-72 shrink-0 h-full z-10 shadow-xl border-r border-border bg-card/50 backdrop-blur-sm">
                  <WorldBuilderSidebar 
                    locations={locations}
                    regions={regions}
                    selectedLocationId={selectedLocation?.id}
                    onSelectLocation={setSelectedLocation}
                    onAddLocation={handleAddLocation}
                    onAddRegion={handleAddRegion}
                    onAddConnection={handleAddConnection}
                    filters={filters}
                    setFilters={setFilters}
                  />
                </div>

                {/* Center Map */}
                <div className="flex-1 h-full relative z-0 bg-muted/20">
                  <WorldMap 
                    locations={locations.filter(loc => {
                      if (filters.type !== 'all' && loc.type !== filters.type) return false;
                      if (filters.region !== 'all' && loc.regionId !== filters.region) return false;
                      return true;
                    })}
                    regions={regions}
                    connections={connections}
                    selectedLocationId={selectedLocation?.id}
                    onSelectLocation={setSelectedLocation}
                    onMapDoubleClick={handleMapDoubleClick}
                  />
                </div>

                {/* Right Panel */}
                <div className={`w-80 shrink-0 h-full z-10 shadow-xl border-l border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ${selectedLocation ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                  <LocationDetails 
                    location={selectedLocation}
                    regions={regions}
                    connections={connections}
                    allLocations={locations}
                    onEdit={handleEditLocation}
                    onDeleteSuccess={() => {
                      setSelectedLocation(null);
                      fetchData();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {world && (
          <>
            <LocationForm 
              isOpen={isLocFormOpen}
              onClose={() => setIsLocFormOpen(false)}
              location={editingLoc}
              regions={regions}
              worldId={world.id}
              defaultX={clickCoords.x}
              defaultY={clickCoords.y}
              onSaveSuccess={fetchData}
            />
            <RegionForm 
              isOpen={isRegFormOpen}
              onClose={() => setIsRegFormOpen(false)}
              region={editingReg}
              worldId={world.id}
              onSaveSuccess={fetchData}
            />
            <ConnectionForm 
              isOpen={isConnFormOpen}
              onClose={() => setIsConnFormOpen(false)}
              connection={editingConn}
              locations={locations}
              worldId={world.id}
              onSaveSuccess={fetchData}
            />
          </>
        )}
      </PremiumFeatureGate>
    </AppLayout>
  );
};

export default StoryArchitectPage;