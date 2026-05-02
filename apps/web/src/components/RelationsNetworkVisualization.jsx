import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { RELATIONSHIP_TYPES } from './RelationshipLegend.jsx';

const TYPE_COLORS = RELATIONSHIP_TYPES.reduce((acc, type) => {
  acc[type.id] = type.color;
  return acc;
}, {});

const RelationsNetworkVisualization = ({ characters, relationships, onNodeClick, onLinkClick }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const nodes = characters.map(char => {
      const charRels = relationships.filter(r => r.characterA_id === char.id || r.characterB_id === char.id);
      const primaryRel = charRels.length > 0 ? charRels[0].relationship_type : 'other';
      
      return {
        id: char.id,
        name: char.name,
        val: 1,
        primaryColor: TYPE_COLORS[primaryRel] || TYPE_COLORS.other,
        ...char
      };
    });

    const links = relationships.map(rel => ({
      source: rel.characterA_id,
      target: rel.characterB_id,
      type: rel.relationship_type,
      strength: rel.dynamics ? Math.min(4, Math.max(1, rel.dynamics.length / 20)) : 2,
      ...rel
    }));

    return { nodes, links };
  }, [characters, relationships]);

  const drawNode = useCallback((node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 14 / globalScale;
    const nodeRadius = 10;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.primaryColor;
    ctx.globalAlpha = 0.2;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'hsl(218, 29%, 10%)';
    ctx.fill();
    
    ctx.lineWidth = 2 / globalScale;
    ctx.strokeStyle = node.primaryColor;
    ctx.stroke();

    const initials = label.substring(0, 2).toUpperCase();
    ctx.font = `bold ${10 / globalScale}px "EB Garamond", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'hsl(42, 24%, 92%)';
    ctx.fillText(initials, node.x, node.y);

    ctx.font = `${fontSize}px "EB Garamond", serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
    
    ctx.fillStyle = 'rgba(10, 13, 18, 0.75)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2, 
      node.y + nodeRadius + 4 - bckgDimensions[1] / 2, 
      bckgDimensions[0], 
      bckgDimensions[1]
    );

    ctx.fillStyle = 'hsl(42, 24%, 92%)';
    ctx.fillText(label, node.x, node.y + nodeRadius + 4);
  }, []);

  const drawLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    
    if (!start || !end || typeof start.x !== 'number' || typeof end.x !== 'number') return;
    
    const color = TYPE_COLORS[link.type] || TYPE_COLORS.other;
    const thickness = (link.strength || 2) / globalScale;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 / globalScale;
    
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  return (
    <div ref={containerRef} className="network-container cosmic-bg w-full h-full">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={link => TYPE_COLORS[link.type] || TYPE_COLORS.other}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        backgroundColor="transparent"
        d3VelocityDecay={0.3}
        cooldownTicks={100}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};

export default RelationsNetworkVisualization;