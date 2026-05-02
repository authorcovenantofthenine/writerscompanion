import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { getScenesByChapter } from '@/lib/ManuscriptCompilationService.js';
import { useTemplates } from '@/hooks/useTemplates.js';
import { useAutoSave } from '@/hooks/useAutoSave.js';
import { useAutoSaveContext } from '@/contexts/AutoSaveContext.jsx';

import ManuscriptTopBar from '@/components/ManuscriptTopBar.jsx';
import ManuscriptSidebar from '@/components/ManuscriptSidebar.jsx';
import ManuscriptToolbar from '@/components/ManuscriptToolbar.jsx';
import ManuscriptEditor from '@/components/ManuscriptEditor.jsx';
import ManuscriptsList from '@/components/ManuscriptsList.jsx';
import AutoSaveIndicator from '@/components/AutoSaveIndicator.jsx';
import PomodoroWidget from '@/components/PomodoroWidget.jsx';
import DraftComparison from '@/components/DraftComparison.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ManuscriptPage = () => {
  const { currentProject } = useProject();
  const { currentUser } = useAuth();
  const { activeTemplate } = useTemplates();
  const { offlineMode } = useAutoSaveContext();
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('manuscriptPageTab') || 'editor');
  const [editingManuscriptId, setEditingManuscriptId] = useState(null);

  const [chaptersWithScenes, setChaptersWithScenes] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [metadata, setMetadata] = useState(null);
  
  // Track if user explicitly edited content vs loaded from DB
  const [isDirty, setIsDirty] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  
  const [editorInstance, setEditorInstance] = useState(null);
  const [stats, setStats] = useState({ wordCount: 0, characterCount: 0 });
  const [currentScene, setCurrentScene] = useState(null);

  const editorRef = useRef(null);

  // AutoSave Integration
  const collectionName = currentSelection?.type === 'scene' ? 'scenes' : null;
  
  // Ensure precise data types and non-null values for the save payload
  const savePayload = currentSelection?.type === 'scene' 
    ? { 
        content: String(editorContent || ''), 
        wordCount: Number(stats.wordCount) || 0 
      }
    : { 
        content: String(editorContent || '') 
      };

  const { isSaving, lastSaved, error, triggerSave } = useAutoSave(
    collectionName,
    currentSelection?.id,
    savePayload,
    2500,
    isDirty
  );

  // Display error toast if auto-save fails
  useEffect(() => {
    if (error) {
      toast.error(`Auto-save failed: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    localStorage.setItem('manuscriptPageTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentProject && currentUser && activeTab === 'editor') {
      fetchData();
    }
  }, [currentProject, currentUser, activeTab]);

  const fetchData = async () => {
    try {
      const data = await getScenesByChapter(currentProject.id, currentUser.id);
      setChaptersWithScenes(data);
      
      const metaRecords = await pb.collection('manuscript_metadata').getFullList({
        filter: `projectId="${currentProject.id}"`,
        $autoCancel: false
      });
      if (metaRecords.length > 0) {
        setMetadata(metaRecords[0]);
      }

      if (!currentSelection && data.length > 0 && data[0].scenes?.length > 0) {
        handleSelectionSelect({ type: 'scene', id: data[0].scenes[0].id });
      }
    } catch (err) {
      console.error('Error fetching manuscript data:', err);
      toast.error('Failed to load manuscript data');
    }
  };

  const handleSelectionSelect = async (selection) => {
    // Capture version snapshot if the outgoing scene was modified
    if (currentSelection?.type === 'scene' && isDirty && currentSelection.id !== selection.id) {
      if (editorContent && editorContent.trim().length > 0) {
        pb.collection('version_history').create({
          noteId: currentSelection.id,
          projectId: currentProject.id,
          userId: currentUser.id,
          previousContent: editorContent,
          changeDescription: 'Auto-saved before navigation'
        }, { $autoCancel: false }).catch(console.error);
      }
    }

    setCurrentSelection(selection);
    setIsDirty(false); // Reset dirty flag when preparing to load a new record

    try {
      if (selection.type === 'scene') {
        const scene = await pb.collection('scenes').getOne(selection.id, { $autoCancel: false });
        setEditorContent(scene.content || '');
        setStats({ wordCount: scene.wordCount || 0, characterCount: (scene.content || '').length });
        setCurrentScene(scene);
        setIsDirty(false); // Ensure it remains false after loading initial content
      }
    } catch (err) {
      console.error('Error loading content:', err);
      toast.error('Failed to load content');
    }
  };

  const handleContentChange = (newContent) => {
    setEditorContent(newContent);
    setIsDirty(true); // Flag that user has made intentional edits
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      setIsSidebarOpen(false);
      setIsToolbarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setIsToolbarOpen(true);
    }
  };

  const handleEditManuscript = (id) => {
    setEditingManuscriptId(id);
    setActiveTab('editor');
  };

  const handleSessionComplete = useCallback(async (mode, durationSeconds, wordsWritten) => {
    if (mode === 'focus' && wordsWritten > 0 && currentProject && currentUser) {
      try {
        const today = new Date().toISOString();
        await pb.collection('writing_history').create({
          userId: currentUser.id,
          projectId: currentProject.id,
          date: today,
          word_count: wordsWritten
        }, { $autoCancel: false });
        
        toast.success(`Focus session complete! Logged ${wordsWritten} words.`, {
          icon: '✍️'
        });
      } catch (error) {
        console.error('Failed to save writing history:', error);
        toast.error('Failed to log session word count.');
      }
    }
  }, [currentProject, currentUser]);

  const handleOpenComparison = () => {
    setIsComparisonOpen(true);
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background">
        <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        <p className="text-muted-foreground">Please select a project to write.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      <Helmet>
        <title>Manuscripts - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <AutoSaveIndicator 
        isSaving={isSaving} 
        lastSaved={lastSaved} 
        error={error} 
        isOffline={offlineMode}
        onRetry={() => triggerSave(savePayload)}
      />

      {/* Floating Pomodoro Widget */}
      <PomodoroWidget 
        currentWordCount={stats.wordCount} 
        onSessionComplete={handleSessionComplete} 
      />

      {/* Draft Comparison Overlay */}
      {isComparisonOpen && currentScene && (
        <DraftComparison 
          currentScene={currentScene}
          onClose={handleCloseComparison}
        />
      )}

      {!isFocusMode && (
        <div className="border-b px-4 py-2 bg-card flex items-center justify-between shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="manuscripts">Current Manuscripts</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {activeTab === 'manuscripts' && (
        <div className="flex-1 overflow-y-auto bg-muted/10">
          <ManuscriptsList onEditManuscript={handleEditManuscript} />
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto bg-muted/10 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Templates</h2>
            <p className="text-muted-foreground">Template management coming soon.</p>
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <>
          {!isFocusMode && (
            <ManuscriptTopBar 
              saveStatus={isSaving ? 'saving' : error ? 'unsaved' : 'saved'}
              isFocusMode={isFocusMode}
              toggleFocusMode={toggleFocusMode}
              currentScene={currentScene}
              onOpenComparison={handleOpenComparison}
            />
          )}

          <div className="flex flex-1 overflow-hidden relative">
            {!isSidebarOpen && !isFocusMode && (
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute left-0 top-4 z-20 rounded-l-none border-l-0 shadow-md"
                onClick={() => setIsSidebarOpen(true)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            <ManuscriptSidebar 
              isOpen={isSidebarOpen && !isFocusMode}
              onToggle={() => setIsSidebarOpen(false)}
              chaptersWithScenes={chaptersWithScenes}
              currentSelection={currentSelection}
              onSceneSelect={handleSelectionSelect}
            />

            <ManuscriptEditor 
              ref={editorRef}
              content={editorContent}
              onChange={handleContentChange}
              onEditorReady={setEditorInstance}
              onStatsChange={setStats}
            />

            {!isToolbarOpen && !isFocusMode && (
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-0 top-4 z-20 rounded-r-none border-r-0 shadow-md"
                onClick={() => setIsToolbarOpen(true)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            <ManuscriptToolbar 
              isOpen={isToolbarOpen && !isFocusMode}
              onToggle={() => setIsToolbarOpen(false)}
              editor={editorInstance}
              wordCount={stats.wordCount}
              characterCount={stats.characterCount}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ManuscriptPage;