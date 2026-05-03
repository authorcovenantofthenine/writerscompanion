import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Edit2, Trash2, MapPin, Building2, Home, Castle, TreePine, Mountain, Palmtree, Tent, Landmark, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const TYPE_ICONS = {
  city: Building2,
  village: Home,
  castle: Castle,
  forest: TreePine,
  mountain: Mountain,
  island: Palmtree,
  ruin: Tent,
  temple: Landmark,
  other: MapPin
};

const LocationDetails = ({ location, regions, connections, allLocations, onEdit, onDeleteSuccess }) => {
  if (!location) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <MapPin className="h-12 w-12 mb-4 opacity-20" />
        <p>Select a location on the map or from the list to view details.</p>
      </div>
    );
  }

  const Icon = TYPE_ICONS[location.type] || MapPin;
  const region = regions.find(r => r.id === location.regionId);
  
  const locationConnections = connections.filter(
    c => c.locationA_id === location.id || c.locationB_id === location.id
  );

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${location.name}? This will also remove all its connections.`)) return;
    
    try {
      // Delete associated connections first
      for (const conn of locationConnections) {
        await pb.collection('location_connections').delete(conn.id, { $autoCancel: false });
      }
      // Delete location
      await pb.collection('locations').delete(location.id, { $autoCancel: false });
      toast.success('Location deleted.');
      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location.');
    }
  };

  const getOtherLocationName = (conn) => {
    const otherId = conn.locationA_id === location.id ? conn.locationB_id : conn.locationA_id;
    const otherLoc = allLocations.find(l => l.id === otherId);
    return otherLoc ? otherLoc.name : 'Unknown';
  };

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-l border-border/50">
      <div className="p-6 border-b border-border/30 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">{location.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize text-xs">{location.type}</Badge>
                {region && (
                  <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary-foreground">
                    {region.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(location)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {location.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
              <p className="text-sm leading-relaxed text-foreground/90">{location.description}</p>
            </div>
          )}

          {location.significance && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Significance</h4>
              <p className="text-sm leading-relaxed text-foreground/90">{location.significance}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Connections
            </h4>
            {locationConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No connections established yet.</p>
            ) : (
              <div className="space-y-2">
                {locationConnections.map(conn => (
                  <div key={conn.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{getOtherLocationName(conn)}</span>
                      <Badge variant="outline" className="text-[10px] capitalize border-primary/30 text-primary">
                        {conn.relationship_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {conn.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{conn.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LocationDetails;