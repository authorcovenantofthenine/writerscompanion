import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { toast } from 'sonner';
import { manuscriptTemplates } from '@/lib/manuscriptTemplates.js';

export const useTemplates = () => {
  const { currentProject } = useProject();
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [metadataId, setMetadataId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveTemplate = useCallback(async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      const records = await pb.collection('manuscript_metadata').getFullList({
        filter: `projectId="${currentProject.id}"`,
        $autoCancel: false
      });
      
      if (records.length > 0) {
        setMetadataId(records[0].id);
        setActiveTemplateId(records[0].appliedTemplate || null);
      }
    } catch (error) {
      console.error('Error fetching template metadata:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchActiveTemplate();
  }, [fetchActiveTemplate]);

  const applyTemplate = async (templateId) => {
    if (!currentProject) {
      toast.error('No active project selected.');
      return false;
    }

    try {
      if (metadataId) {
        await pb.collection('manuscript_metadata').update(metadataId, {
          appliedTemplate: templateId
        }, { $autoCancel: false });
      } else {
        const newRecord = await pb.collection('manuscript_metadata').create({
          projectId: currentProject.id,
          userId: pb.authStore.model.id,
          appliedTemplate: templateId
        }, { $autoCancel: false });
        setMetadataId(newRecord.id);
      }
      
      setActiveTemplateId(templateId);
      toast.success('Template applied successfully.');
      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template.');
      return false;
    }
  };

  const createManuscriptFromTemplate = async (template, manuscriptName) => {
    if (!currentProject) {
      toast.error('No active project selected.');
      return null;
    }

    try {
      // Create a new manuscript record with the template's formatting
      const newManuscript = await pb.collection('manuscripts').create({
        title: manuscriptName,
        content: '', // Start empty
        formatting: JSON.stringify({
          ...template.specifications,
          styles: template.styles,
          hasBleed: template.hasBleed,
          isFlowable: template.isFlowable
        }),
        template_id: template.id,
        projectId: currentProject.id,
        userId: pb.authStore.model.id
      }, { $autoCancel: false });

      toast.success('Manuscript created successfully.');
      return newManuscript.id;
    } catch (error) {
      console.error('Error creating manuscript:', error);
      toast.error('Failed to create manuscript.');
      return null;
    }
  };

  const activeTemplate = manuscriptTemplates.find(t => t.id === activeTemplateId) || null;

  return {
    templates: manuscriptTemplates,
    activeTemplateId,
    activeTemplate,
    applyTemplate,
    createManuscriptFromTemplate,
    isLoading
  };
};