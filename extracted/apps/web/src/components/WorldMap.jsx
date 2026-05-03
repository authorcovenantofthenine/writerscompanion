import React, { useState, useRef, useEffect } from 'react';
import { Building2, Home, Castle, TreePine, Mountain, Palmtree, Tent, Landmark, MapPin } from 'lucide-react';

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

const CONNECTION_COLORS = {
  trade_route: 'hsl(45, 93%, 47%)', // mystical-gold
  alliance: 'hsl(140, 50%, 45%)', // green
  conflict: 'hsl(0, 70%, 45%)', // red
  family_bond: 'hsl(210, 60%, 55%)', // blue
  other: 'hsl(40, 20%, 50%)' // gray
};

const WorldMap = ({ 
  locations, 
  regions, 
  connections, 
  selectedLocationId, 
  onSelectLocation,
  onMapDoubleClick
}) => {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Center map initially if there are locations
  useEffect(() => {
    if (locations.length > 0 && transform.scale === 1 && transform.x === 0 && transform.y === 0) {
      const xs = locations.map(l => l.x);
      const ys = locations.map(l => l.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setTransform({
          x: rect.width / 2 - centerX,
          y: rect.height / 2 - centerY,
          scale: 1
        });
      }
    }
  }, [locations.length]);

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale * (1 + scaleAmount)), 5);
    
    // Zoom towards mouse pointer
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const targetX = (mouseX - transform.x) / transform.scale;
      const targetY = (mouseY - transform.y) / transform.scale;
      
      setTransform({
        x: mouseX - targetX * newScale,
        y: mouseY - targetY * newScale,
        scale: newScale
      });
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleDoubleClick = (e) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const mapX = (mouseX - transform.x) / transform.scale;
      const mapY = (mouseY - transform.y) / transform.scale;
      
      onMapDoubleClick(mapX, mapY);
    }
  };

  // Calculate region centers for background blobs
  const regionCenters = regions.map(region => {
    const regionLocs = locations.filter(l => l.regionId === region.id);
    if (regionLocs.length === 0) return null;
    
    const avgX = regionLocs.reduce((sum, l) => sum + l.x, 0) / regionLocs.length;
    const avgY = regionLocs.reduce((sum, l) => sum + l.y, 0) / regionLocs.length;
    
    // Calculate rough radius based on spread
    let maxDist = 100;
    regionLocs.forEach(l => {
      const dist = Math.sqrt(Math.pow(l.x - avgX, 2) + Math.pow(l.y - avgY, 2));
      if (dist > maxDist) maxDist = dist;
    });
    
    return { ...region, x: avgX, y: avgY, radius: maxDist + 100 };
  }).filter(Boolean);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0A0D12] cursor-grab active:cursor-grabbing">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: `${50 * transform.scale}px ${50 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`
        }}
      />

      <svg
        ref={svgRef}
        className="w-full h-full absolute inset-0"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          
          {/* Regions (Background Blobs) */}
          {regionCenters.map(rc => (
            <g key={`region-${rc.id}`}>
              <circle
                cx={rc.x}
                cy={rc.y}
                r={rc.radius}
                fill={rc.color || 'hsl(var(--muted))'}
                opacity="0.15"
                filter="blur(40px)"
              />
              <text
                x={rc.x}
                y={rc.y - rc.radius + 40}
                textAnchor="middle"
                fill={rc.color || 'hsl(var(--muted))'}
                opacity="0.4"
                className="font-cinzel text-4xl font-bold tracking-widest pointer-events-none select-none"
              >
                {rc.name.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Connections */}
          {connections.map(conn => {
            const locA = locations.find(l => l.id === conn.locationA_id);
            const locB = locations.find(l => l.id === conn.locationB_id);
            if (!locA || !locB) return null;

            const color = CONNECTION_COLORS[conn.relationship_type] || CONNECTION_COLORS.other;
            const isDashed = conn.relationship_type === 'conflict';

            return (
              <line
                key={conn.id}
                x1={locA.x}
                y1={locA.y}
                x2={locB.x}
                y2={locB.y}
                stroke={color}
                strokeWidth={2 / transform.scale}
                strokeDasharray={isDashed ? `${8/transform.scale},${8/transform.scale}` : 'none'}
                opacity="0.6"
                className="transition-all duration-300 hover:opacity-100 hover:stroke-width-[4px]"
              />
            );
          })}

          {/* Locations */}
          {locations.map(loc => {
            const isSelected = selectedLocationId === loc.id;
            const Icon = TYPE_ICONS[loc.type] || MapPin;
            const region = regions.find(r => r.id === loc.regionId);
            const nodeColor = region?.color || 'hsl(var(--primary))';

            return (
              <g 
                key={loc.id} 
                transform={`translate(${loc.x}, ${loc.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                {/* Glow effect when selected or hovered */}
                <circle
                  r={24 / transform.scale}
                  fill={nodeColor}
                  opacity={isSelected ? 0.3 : 0}
                  className="transition-opacity duration-300 group-hover:opacity-20"
                  filter="blur(8px)"
                />
                
                {/* Node Background */}
                <circle
                  r={12 / transform.scale}
                  fill="hsl(var(--background))"
                  stroke={isSelected ? 'hsl(var(--primary))' : nodeColor}
                  strokeWidth={isSelected ? 3 / transform.scale : 1.5 / transform.scale}
                  className="transition-all duration-300"
                />
                
                {/* We can't easily render Lucide React components inside SVG without foreignObject, 
                    so we use a foreignObject to render the HTML icon perfectly centered */}
                <foreignObject 
                  x={-8 / transform.scale} 
                  y={-8 / transform.scale} 
                  width={16 / transform.scale} 
                  height={16 / transform.scale}
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex items-center justify-center text-foreground">
                    <Icon style={{ width: '100%', height: '100%', color: isSelected ? 'hsl(var(--primary))' : 'inherit' }} />
                  </div>
                </foreignObject>

                {/* Label */}
                <text
                  y={24 / transform.scale}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  className={`font-serif text-sm transition-all duration-300 select-none pointer-events-none ${isSelected ? 'font-bold drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]' : 'opacity-80'}`}
                  style={{ fontSize: `${14 / transform.scale}px` }}
                >
                  {loc.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-lg p-2 text-xs text-muted-foreground shadow-lg">
          <p>Scroll to Zoom</p>
          <p>Drag to Pan</p>
          <p>Double-click to Add</p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;