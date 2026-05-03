import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Filter, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useTimeline } from '@/hooks/useTimeline.js';
import CharacterNode from '@/components/CharacterNode.jsx';
import TimelineEventMarker from '@/components/TimelineEventMarker.jsx';
import TimelineEventModal from '@/components/TimelineEventModal.jsx';
import TimelineChapterModal from '@/components/TimelineChapterModal.jsx';

const COLORS = ['char-gold', 'char-blue', 'char-purple', 'char-cyan', 'char-red'];

export default function ChronosView() {
  const { 
    events, chapters, characters, isLoading, selectedCharacterId,
    addEvent, updateEvent, deleteEvent, addChapter, filterByCharacter 
  } = useTimeline();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
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
        <title>Chronos Timeline - Quil Forge</title>
      </Helmet>

      <div className="absolute inset-0 cosmic-starfield -z-10 opacity-50 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif text-glow-gold flex items-center gap-3">
              <Clock className="w-8 h-8" />
              Chronos Timeline
            </h1>
            <p className="text-muted-foreground mt-1">Map the events of your universe</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsChapterModalOpen(true)} variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Plus className="mr-2 h-4 w-4" /> Add Chapter
            </Button>
            <Button onClick={handleAddEvent} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>

        {/* Character Filter Row */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" /> Filter by Character Arc
          </div>
          <div className="flex flex-wrap gap-6">
            {characters.map((char, idx) => (
              <CharacterNode 
                key={char.id}
                character={char}
                isSelected={selectedCharacterId === char.id}
                onClick={filterByCharacter}
                colorClass={COLORS[idx % COLORS.length]}
              />
            ))}
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

          {/* Chapters/Acts Track (Below Timeline) */}
          <div className="flex gap-4 min-w-max px-12 mt-4">
            {chapters.map(chapter => (
              <div key={chapter.id} className="bg-secondary/10 border border-secondary/30 rounded-md p-3 min-w-[250px]">
                <h5 className="font-serif font-bold text-secondary-foreground">{chapter.name}</h5>
                <p className="text-xs text-muted-foreground">{chapter.startTime} - {chapter.endTime}</p>
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
        chapters={chapters}
        characters={characters}
      />

      <TimelineChapterModal 
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        onSave={addChapter}
      />

    </AppLayout>
  );
}