import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const sanitizeScenePayload = (data) => {
  const allowedStatuses = ['draft', 'in-progress', 'complete'];
  const immutableFields = ['id', 'created', 'updated', 'lastEdited'];
  const requiredFields = ['title', 'projectId', 'userId', 'chapter_id'];
  const sanitized = {};

  Object.keys(data).forEach(key => {
    // 1. Remove immutable fields
    if (immutableFields.includes(key)) return;
    
    // 2. Remove undefined and null values
    if (data[key] === undefined || data[key] === null) return;

    let value = data[key];

    // 3. Remove empty strings from optional fields to prevent 400 errors on strict fields
    if (typeof value === 'string' && value.trim() === '' && !requiredFields.includes(key)) {
      return;
    }

    // 4. Ensure relation fields are strings (IDs) and not objects
    if (['chapter_id', 'projectId', 'userId'].includes(key)) {
      if (typeof value === 'object' && value !== null) {
        value = value.id || '';
      }
      // Ensure it's a string
      value = String(value);
    }

    // 5. Validate enum fields against allowed values
    if (key === 'status') {
      if (!allowedStatuses.includes(value)) {
        value = 'draft'; // Fallback to default
      }
    }

    sanitized[key] = value;
  });

  return sanitized;
};

export const useProjectContext = () => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [worldElements, setWorldElements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manuscriptWordCount, setManuscriptWordCount] = useState(0);

  const fetchProjectContext = useCallback(async () => {
    if (!currentProject || !currentUser) {
      setCharacters([]);
      setScenes([]);
      setWorldElements([]);
      setManuscriptWordCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const [charactersData, scenesData, worldData] = await Promise.all([
        pb.collection('characters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'created',
          $autoCancel: false
        }),
        pb.collection('scenes').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'order',
          $autoCancel: false
        }),
        pb.collection('world_elements').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'created',
          $autoCancel: false
        })
      ]);

      setCharacters(charactersData);
      setScenes(scenesData);
      setWorldElements(worldData);

      const totalWords = scenesData.reduce((sum, scene) => sum + (scene.wordCount || 0), 0);
      setManuscriptWordCount(totalWords);
    } catch (error) {
      console.error('Error fetching project context:', error);
      if (error?.status === 403) {
        console.warn('Permission denied when fetching project context. User may not have access to all resources.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, currentUser]);

  useEffect(() => {
    fetchProjectContext();
  }, [fetchProjectContext]);

  const getContextSummary = useCallback(() => {
    if (!currentProject) return '';

    const characterNames = characters.map(c => c.name).join(', ');
    const sceneCount = scenes.length;
    const worldCount = worldElements.length;

    return `Project: ${currentProject.name}
Genre: ${currentProject.genre || 'Fiction'}
Tone: ${currentProject.tone || 'Not specified'}
Themes: ${currentProject.themes || 'Not specified'}
Characters (${characters.length}): ${characterNames || 'None yet'}
Scenes: ${sceneCount}
World Elements: ${worldCount}
Total Word Count: ${manuscriptWordCount.toLocaleString()}`;
  }, [currentProject, characters, scenes, worldElements, manuscriptWordCount]);

  const getRecentManuscriptContent = useCallback(() => {
    const recentScenes = scenes.slice(-3);
    return recentScenes.map(s => `Scene: ${s.title}\n${s.content || s.synopsis || ''}`).join('\n\n---\n\n');
  }, [scenes]);

  return {
    currentProject,
    characters,
    scenes,
    worldElements,
    manuscriptWordCount,
    isLoading,
    refreshContext: fetchProjectContext,
    getContextSummary,
    getRecentManuscriptContent
  };
};