import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useTimeline } from '@/hooks/useTimeline.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import TimelineEventMarker from '@/components/TimelineEventMarker.jsx';
import TimelineEventModal from '@/components/TimelineEventModal.jsx';
import TimelineArcModal from '@/components/TimelineArcModal.jsx';

export default function TimelinePage() {
  const { currentProject } = useProject();
  const { 
    events, arcs, characters, isLoading,
    addEvent, updateEvent, deleteEvent, addArc
  } = useTimeline();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isArcModalOpen, setIsArcModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Clock className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select or create a project from the Projects page to view the timeline.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Timeline - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <PremiumFeatureGate
        featureName="Timeline Creator"
        featureDescription="Timeline is a Writer Plan feature. Get access for $27/month."
      >
        <div className="absolute inset-0 cosmic-starfield -z-10 opacity-50 pointer-events-none" />

        <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-serif text-gold-gradient flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                Chronos Timeline
              </h1>
              <p className="text-muted-foreground mt-1">Map the events of your universe</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsArcModalOpen(true)} variant="outline" className="border-primary/50 hover:bg-primary/10">
                <Plus className="mr-2 h-4 w-4" /> Add Arc
              </Button>
              <Button onClick={handleAddEvent} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </div>
          </div>

          {/* Timeline Visualization Area */}
          <div className="relative w-full overflow-x-auto custom-scrollbar pb-12 pt-24 px-8 bg-black/20 rounded-2xl border border-border/20 min-h-[500px]">
            
            {/* The Horizontal Track */}
            <div className="timeline-track min-w-max flex gap-16 items-end px-12">
              {events.length === 0 ? (
                <div className="w-full text-center text-muted-foreground py-12 font-serif italic">
                  The tapestry of time is blank. Add an event to begin.
                </div>
              ) : (
                events.map((event) => (
                  <TimelineEventMarker 
                    key={event.id} 
                    event={event} 
                    onClick={handleEditEvent} 
                  />
                ))
              )}
            </div>

            {/* Arcs/Acts Track (Below Timeline) */}
            <div className="flex gap-4 min-w-max px-12 mt-4">
              {arcs.map(arc => (
                <div key={arc.id} className="bg-secondary/10 border border-secondary/30 rounded-md p-3 min-w-[250px]">
                  <h5 className="font-serif font-bold text-secondary-foreground">{arc.name}</h5>
                  <p className="text-xs text-muted-foreground">{arc.startTime} - {arc.endTime}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        <TimelineEventModal 
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={deleteEvent}
          event={editingEvent}
          chapters={arcs} // Passing arcs as chapters to maintain compatibility with TimelineEventModal
          characters={characters}
        />

        <TimelineArcModal 
          isOpen={isArcModalOpen}
          onClose={() => setIsArcModalOpen(false)}
          onSave={addArc}
        />
      </PremiumFeatureGate>
    </AppLayout>
  );
}