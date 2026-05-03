import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Plus, Search, MapPin, Building2, Home, Castle, TreePine, Mountain, Palmtree, Tent, Landmark, Map } from 'lucide-react';

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

const WorldBuilderSidebar = ({ 
  locations, 
  regions, 
  selectedLocationId, 
  onSelectLocation,
  onAddLocation,
  onAddRegion,
  onAddConnection,
  filters,
  setFilters
}) => {
  
  const filteredLocations = locations.filter(loc => {
    if (filters.search && !loc.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type !== 'all' && loc.type !== filters.type) return false;
    if (filters.region !== 'all' && loc.regionId !== filters.region) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-r border-border/50">
      <div className="p-4 border-b border-border/30 space-y-4 shrink-0">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <h2 className="font-serif font-bold text-lg">World Elements</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={onAddLocation} className="w-full text-xs h-8">
            <Plus className="h-3 w-3 mr-1" /> Location
          </Button>
          <Button size="sm" variant="outline" onClick={onAddRegion} className="w-full text-xs h-8">
            <Plus className="h-3 w-3 mr-1" /> Region
          </Button>
          <Button size="sm" variant="outline" onClick={onAddConnection} className="w-full text-xs h-8 col-span-2">
            <Plus className="h-3 w-3 mr-1" /> Connection
          </Button>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations..." 
              className="pl-9 h-9 bg-background/50 text-sm"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
              <SelectTrigger className="h-8 text-xs bg-background/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(TYPE_ICONS).map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.region} onValueChange={(val) => setFilters(prev => ({ ...prev, region: val }))}>
              <SelectTrigger className="h-8 text-xs bg-background/50">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredLocations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No locations found.</p>
          ) : (
            filteredLocations.map(loc => {
              const Icon = TYPE_ICONS[loc.type] || MapPin;
              const isSelected = selectedLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    isSelected 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-muted text-foreground/80 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium truncate">{loc.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize truncate">
                      {loc.type} {regions.find(r => r.id === loc.regionId)?.name ? `• ${regions.find(r => r.id === loc.regionId).name}` : ''}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WorldBuilderSidebar;