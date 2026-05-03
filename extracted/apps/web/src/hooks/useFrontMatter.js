import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useFrontMatter = (projectId, userId) => {
  const [frontMatter, setFrontMatter] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFrontMatter = useCallback(async () => {
    if (!projectId || !userId) return;
    setIsLoading(true);
    try {
      const records = await pb.collection('front_matter').getFullList({
        filter: `projectId="${projectId}"`,
        sort: 'order',
        $autoCancel: false
      });
      setFrontMatter(records);
    } catch (error) {
      console.error('Error fetching front matter:', error);
      toast.error('Failed to load front matter sections.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, userId]);

  useEffect(() => {
    fetchFrontMatter();
  }, [fetchFrontMatter]);

  const createSection = async (sectionType, title = '') => {
    if (!sectionType) {
      console.error('Cannot create front matter: sectionType is required');
      return null;
    }

    try {
      const newOrder = frontMatter.length > 0 ? Math.max(...frontMatter.map(f => f.order || 0)) + 1 : 0;
      
      const payload = {
        projectId,
        userId,
        sectionType,
        title: title || sectionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content: '',
        order: newOrder,
        isActive: true
      };

      const record = await pb.collection('front_matter').create(payload, { $autoCancel: false });
      
      setFrontMatter(prev => [...prev, record]);
      toast.success('Front matter section added.');
      return record;
    } catch (error) {
      console.error('Error creating front matter:', error);
      toast.error('Failed to create section.');
      return null;
    }
  };

  const updateSection = async (id, data) => {
    try {
      const sanitizedData = { ...data };

      if ('name' in sanitizedData) {
        delete sanitizedData.name;
      }

      if ('type' in sanitizedData && !sanitizedData.sectionType) {
        sanitizedData.sectionType = sanitizedData.type;
        delete sanitizedData.type;
      }

      const record = await pb.collection('front_matter').update(id, sanitizedData, { $autoCancel: false });
      setFrontMatter(prev => prev.map(item => item.id === id ? record : item));
      return record;
    } catch (error) {
      console.error('Error updating front matter:', error);
      toast.error('Failed to save section.');
      return null;
    }
  };

  const deleteSection = async (id) => {
    try {
      await pb.collection('front_matter').delete(id, { $autoCancel: false });
      setFrontMatter(prev => prev.filter(item => item.id !== id));
      toast.success('Section deleted.');
    } catch (error) {
      console.error('Error deleting front matter:', error);
      toast.error('Failed to delete section.');
    }
  };

  const reorderSections = async (reorderedList) => {
    setFrontMatter(reorderedList);
    try {
      await Promise.all(reorderedList.map((item, index) =>
        pb.collection('front_matter').update(item.id, { order: index }, { $autoCancel: false })
      ));
    } catch (error) {
      console.error('Error reordering front matter:', error);
      toast.error('Failed to save new order.');
      fetchFrontMatter(); // Revert on failure
    }
  };

  return {
    frontMatter,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    refresh: fetchFrontMatter
  };
};