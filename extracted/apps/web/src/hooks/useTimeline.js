import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { toast } from 'sonner';

export function useTimeline() {
  const { currentProject } = useProject();
  const [events, setEvents] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!currentProject) return;
    setIsLoading(true);
    try {
      const [eventsRes, arcsRes, charsRes] = await Promise.all([
        pb.collection('timeline_events').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'date',
          $autoCancel: false
        }),
        pb.collection('timeline_chapters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'startTime',
          $autoCancel: false
        }),
        pb.collection('characters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          $autoCancel: false
        })
      ]);
      setEvents(eventsRes);
      setArcs(arcsRes);
      setCharacters(charsRes);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      toast.error('Failed to load timeline data');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addEvent = async (data) => {
    try {
      await pb.collection('timeline_events').create({
        ...data,
        projectId: currentProject.id,
        userId: pb.authStore.model.id
      }, { $autoCancel: false });
      toast.success('Event added');
      fetchData();
    } catch (error) {
      toast.error('Failed to add event');
      throw error;
    }
  };

  const updateEvent = async (id, data) => {
    try {
      await pb.collection('timeline_events').update(id, data, { $autoCancel: false });
      toast.success('Event updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await pb.collection('timeline_events').delete(id, { $autoCancel: false });
      toast.success('Event deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete event');
      throw error;
    }
  };

  const addArc = async (data) => {
    try {
      await pb.collection('timeline_chapters').create({
        ...data,
        projectId: currentProject.id,
        userId: pb.authStore.model.id
      }, { $autoCancel: false });
      toast.success('Arc added');
      fetchData();
    } catch (error) {
      toast.error('Failed to add arc');
      throw error;
    }
  };

  const updateArc = async (id, data) => {
    try {
      await pb.collection('timeline_chapters').update(id, data, { $autoCancel: false });
      toast.success('Arc updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update arc');
      throw error;
    }
  };

  const deleteArc = async (id) => {
    try {
      await pb.collection('timeline_chapters').delete(id, { $autoCancel: false });
      toast.success('Arc deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete arc');
      throw error;
    }
  };

  const filterByCharacter = (charId) => {
    setSelectedCharacterId(charId === selectedCharacterId ? null : charId);
  };

  const filteredEvents = selectedCharacterId 
    ? events.filter(e => e.involved_characters && e.involved_characters.includes(selectedCharacterId))
    : events;

  return {
    events: filteredEvents,
    allEvents: events,
    arcs,
    characters,
    isLoading,
    selectedCharacterId,
    addEvent,
    updateEvent,
    deleteEvent,
    addArc,
    updateArc,
    deleteArc,
    filterByCharacter,
    refresh: fetchData
  };
}