import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading1, Heading2, Maximize2, Minimize2, Calendar, PenTool } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useAutoSave } from '@/hooks/useAutoSave.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const SceneEditor = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [manuscriptWordCount, setManuscriptWordCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [writingHistory, setWritingHistory] = useState([]);
  
  const [sceneData, setSceneData] = useState({ content: '', wordCount: 0 });

  // Global AutoSave Hook
  useAutoSave('scenes', currentScene?.id, sceneData, 1500);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[600px] px-12 py-10 text-lg leading-relaxed font-serif text-foreground/90 selection:bg-accent/30'
      }
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      setSceneData({ content: editor.getHTML(), wordCount: words });
    }
  });

  useEffect(() => {
    if (currentProject) {
      fetchScenes();
      fetchWritingHistory();
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentScene && editor) {
      editor.commands.setContent(currentScene.content || '');
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      setSceneData({ content: currentScene.content || '', wordCount: words });
    }
  }, [currentScene, editor]);

  const fetchScenes = async () => {
    if (!currentProject) return;
    try {
      const records = await pb.collection('scenes').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: 'order',
        $autoCancel: false
      });
      setScenes(records);
      
      const totalWords = records.reduce((sum, scene) => sum + (scene.wordCount || 0), 0);
      setManuscriptWordCount(totalWords);

      if (records.length > 0 && !currentScene) {
        setCurrentScene(records[0]);
      }
    } catch (error) {
      console.error('Error fetching scenes:', error);
    }
  };

  const fetchWritingHistory = async () => {
    if (!currentProject) return;
    try {
      const records = await pb.collection('writing_history').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: '-date',
        $autoCancel: false
      });
      setWritingHistory(records);
    } catch (error) {
      console.error('Error fetching writing history:', error);
    }
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <PenTool className="h-20 w-20 text-accent/30 mb-6 flicker-candle" />
        <h2 className="text-3xl font-bold mb-3 text-accent text-glow">No Project Selected</h2>
        <p className="text-accent/70 text-lg">Select a project to open your grimoire</p>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-3 text-accent text-glow">No Scenes Yet</h2>
        <p className="text-accent/70 text-lg">Create scenes in Story Architect to begin writing</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFocusMode ? 'fixed inset-0 z-50 bg-background' : 'min-h-[calc(100vh-4rem)] -m-8 p-8'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none"></div>

      <div className={`relative z-10 ${isFocusMode ? 'h-screen flex flex-col max-w-5xl mx-auto' : 'space-y-8 max-w-7xl mx-auto'}`}>
        <div className={`flex items-center justify-between ${isFocusMode ? 'p-6 border-b border-accent/20 bg-background/80 backdrop-blur-md' : ''}`}>
          <div className="flex items-center gap-6">
            {!isFocusMode && (
              <h2 className="text-3xl font-bold flex items-center gap-3 text-accent text-glow">
                <PenTool className="h-8 w-8 text-success flicker-candle" />
                Scene Editor
              </h2>
            )}
            <Select value={currentScene?.id} onValueChange={(id) => setCurrentScene(scenes.find(s => s.id === id))}>
              <SelectTrigger className="w-[300px] bg-background/60 border-accent/30 text-foreground focus:ring-accent/30">
                <SelectValue placeholder="Select scene" />
              </SelectTrigger>
              <SelectContent className="bg-card border-accent/30">
                {scenes.map((scene) => (
                  <SelectItem key={scene.id} value={scene.id} className="focus:bg-accent/20 focus:text-accent">
                    {/* Safely access title, fallback to Untitled */}
                    {scene?.title || 'Untitled Scene'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="gap-1 border-accent/30 text-accent bg-accent/5">
                Scene: {wordCount} words
              </Badge>
              <Badge variant="outline" className="gap-1 border-success/30 text-success bg-success/5">
                Manuscript: {manuscriptWordCount.toLocaleString()} words
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={toggleFocusMode} size="sm" className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground border border-success/30 shadow-[0_0_10px_hsl(var(--success)/0.2)]">
              {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
            </Button>
          </div>
        </div>

        {!isFocusMode && (
          <div className="flex gap-2 items-center border-b border-accent/20 pb-4">
            <Button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              variant={editor?.isActive('bold') ? 'secondary' : 'ghost'}
              size="sm"
              className={editor?.isActive('bold') ? 'bg-accent/20 text-accent' : 'text-accent/70 hover:text-accent hover:bg-accent/10'}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              variant={editor?.isActive('italic') ? 'secondary' : 'ghost'}
              size="sm"
              className={editor?.isActive('italic') ? 'bg-accent/20 text-accent' : 'text-accent/70 hover:text-accent hover:bg-accent/10'}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-accent/20 mx-2" />
            <Button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              variant={editor?.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
              size="sm"
              className={editor?.isActive('heading', { level: 1 }) ? 'bg-accent/20 text-accent' : 'text-accent/70 hover:text-accent hover:bg-accent/10'}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              variant={editor?.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
              size="sm"
              className={editor?.isActive('heading', { level: 2 }) ? 'bg-accent/20 text-accent' : 'text-accent/70 hover:text-accent hover:bg-accent/10'}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={`${isFocusMode ? 'flex-1 overflow-auto py-8' : ''}`}>
          <Card className={`bg-card/80 backdrop-blur-md border-accent/30 transition-all duration-500 ${isFocusMode ? 'border-0 rounded-none h-full bg-transparent shadow-none' : 'glow-border'}`}>
            <CardContent className={isFocusMode ? 'h-full p-0' : 'p-0'}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-warning/5 via-transparent to-transparent pointer-events-none rounded-t-xl"></div>
                <EditorContent editor={editor} className="min-h-[600px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {!isFocusMode && (
          <Card className="bg-card/80 backdrop-blur-md border-accent/20 glow-soft">
            <CardHeader className="border-b border-accent/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-accent">
                <Calendar className="h-5 w-5 text-success" />
                Writing History
              </CardTitle>
              <CardDescription className="text-accent/60">Track your daily progress in the grimoire</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-background/50 rounded-xl border border-accent/10">
                  <div className="text-3xl font-bold text-success text-glow mb-1">{writingHistory.length}</div>
                  <div className="text-sm text-accent/70 uppercase tracking-wider">Writing Days</div>
                </div>
                <div className="text-center p-6 bg-background/50 rounded-xl border border-accent/10">
                  <div className="text-3xl font-bold text-warning text-glow mb-1">
                    {writingHistory.reduce((sum, h) => sum + h.word_count, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-accent/70 uppercase tracking-wider">Total Words</div>
                </div>
                <div className="text-center p-6 bg-background/50 rounded-xl border border-accent/10">
                  <div className="text-3xl font-bold text-accent text-glow mb-1">
                    {writingHistory.length > 0
                      ? Math.round(writingHistory.reduce((sum, h) => sum + h.word_count, 0) / writingHistory.length)
                      : 0}
                  </div>
                  <div className="text-sm text-accent/70 uppercase tracking-wider">Avg Words/Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SceneEditor;