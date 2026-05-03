import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from './AuthContext.jsx';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    if (!currentUser) {
      setProjects([]);
      setCurrentProject(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const records = await pb.collection('projects').getFullList({
        sort: '-updated',
        $autoCancel: false,
      });
      setProjects(records);
      
      // Set initial project if none selected and projects exist
      if (records.length > 0 && !currentProject) {
        // Try to load from local storage first
        const savedProjectId = localStorage.getItem('currentProjectId');
        const savedProject = records.find(p => p.id === savedProjectId);
        
        if (savedProject) {
          setCurrentProject(savedProject);
        } else {
          setCurrentProject(records[0]);
        }
      } else if (records.length === 0) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const selectProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  };

  const value = {
    currentProject,
    setCurrentProject: selectProject,
    projects,
    refreshProjects: fetchProjects,
    isLoading
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};