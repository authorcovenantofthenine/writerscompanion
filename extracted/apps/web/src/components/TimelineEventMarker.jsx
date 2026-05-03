import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

export default function TimelineEventMarker({ event, onClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center group cursor-pointer min-w-[200px] px-4"
      onClick={() => onClick(event)}
    >
      {/* The Marker Dot */}
      <div className="w-4 h-4 rounded-full bg-primary border-2 border-background z-10 neon-glow-gold transition-transform group-hover:scale-150" />
      
      {/* The Stem */}
      <div className="w-0.5 h-12 bg-primary/30 group-hover:bg-primary/60 transition-colors" />
      
      {/* The Card */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg w-full text-center transition-all group-hover:border-primary/50 group-hover:-translate-y-1">
        <div className="text-xs text-primary font-semibold mb-1 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3" />
          {event.date || 'Unknown Date'}
        </div>
        <h4 className="font-serif font-bold text-foreground leading-tight mb-1">{event.title}</h4>
        {event.category && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            {event.category}
          </span>
        )}
      </div>
    </motion.div>
  );
}