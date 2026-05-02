import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Save, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const StorySpark = () => {
  const { currentUser } = useAuth();
  const { refreshProjects } = useProject();
  const [brainstorms, setBrainstorms] = useState([]);
  const [currentBrainstorm, setCurrentBrainstorm] = useState(null);
  const [ideas, setIdeas] = useState('');
  const [logline, setLogline] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [themes, setThemes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  useEffect(() => {
    fetchBrainstorms();
  }, [currentUser]);

  const fetchBrainstorms = async () => {
    if (!currentUser) return;
    try {
      const records = await pb.collection('brainstorms').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setBrainstorms(records);
      if (records.length > 0 && !currentBrainstorm) {
        loadBrainstorm(records[0]);
      }
    } catch (error) {
      console.error('Error fetching brainstorms:', error);
    }
  };

  const loadBrainstorm = (brainstorm) => {
    setCurrentBrainstorm(brainstorm);
    setIdeas(brainstorm.ideas || '');
    setLogline(brainstorm.logline || '');
    setGenre(brainstorm.genre || '');
    setTone(brainstorm.tone || '');
    setThemes(brainstorm.themes || '');
  };

  const handleAutoSave = () => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    const timeout = setTimeout(() => {
      saveBrainstorm(true);
    }, 2000);
    setAutoSaveTimeout(timeout);
  };

  const saveBrainstorm = async (isAutoSave = false) => {
    if (!currentUser || !ideas.trim()) return;

    setIsSaving(true);
    try {
      const data = {
        ideas,
        logline,
        genre,
        tone,
        themes,
        userId: currentUser.id
      };

      let saved;
      if (currentBrainstorm) {
        saved = await pb.collection('brainstorms').update(currentBrainstorm.id, data, { $autoCancel: false });
      } else {
        saved = await pb.collection('brainstorms').create(data, { $autoCancel: false });
        setCurrentBrainstorm(saved);
      }

      if (!isAutoSave) {
        toast.success('Brainstorm conjured successfully');
      }
      await fetchBrainstorms();
    } catch (error) {
      console.error('Error saving brainstorm:', error);
      if (!isAutoSave) {
        toast.error('Failed to save brainstorm');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const createNewBrainstorm = () => {
    setCurrentBrainstorm(null);
    setIdeas('');
    setLogline('');
    setGenre('');
    setTone('');
    setThemes('');
  };

  const deleteBrainstorm = async () => {
    if (!currentBrainstorm) return;
    try {
      await pb.collection('brainstorms').delete(currentBrainstorm.id, { $autoCancel: false });
      toast.success('Brainstorm banished');
      createNewBrainstorm();
      await fetchBrainstorms();
    } catch (error) {
      console.error('Error deleting brainstorm:', error);
      toast.error('Failed to delete brainstorm');
    }
  };

  const graduateToProject = async () => {
    if (!currentUser || !logline.trim()) {
      toast.error('Please weave a premise first');
      return;
    }

    try {
      const projectData = {
        name: logline.substring(0, 100),
        description: ideas,
        genre,
        tone,
        themes,
        userId: currentUser.id,
        wordCount: 0
      };

      await pb.collection('projects').create(projectData, { $autoCancel: false });
      toast.success('Idea graduated to project realm');
      await refreshProjects();
      createNewBrainstorm();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -m-8 p-8">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background pointer-events-none"></div>

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-accent text-glow">
              <Sparkles className="h-8 w-8 text-success flicker-candle" />
              Story Spark
            </h2>
            <p className="text-accent/70 mt-2 text-lg">Conjure raw ideas and weave them into story premises</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={createNewBrainstorm} variant="outline" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent glow-soft">
              <Sparkles className="h-4 w-4" />
              Conjure New Idea
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/80 backdrop-blur-md glow-border border-accent/40">
              <CardHeader className="border-b border-accent/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-accent">
                  <Sparkles className="h-5 w-5 text-success" />
                  Idea Canvas
                </CardTitle>
                <CardDescription className="text-accent/60">Capture your raw creative sparks in the grimoire</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-success/20 to-accent/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <Textarea
                    value={ideas}
                    onChange={(e) => {
                      setIdeas(e.target.value);
                      handleAutoSave();
                    }}
                    placeholder="Let your imagination flow freely... What if? Who? Where? When? Why?"
                    className="relative min-h-[350px] text-lg bg-background/60 border-accent/20 focus:border-accent/50 focus:ring-accent/30 transition-all shadow-inner text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-sm text-accent/50 flex items-center gap-2">
                    {isSaving ? (
                      <>Saving...</>
                    ) : 'Auto-saves as you write'}
                  </span>
                  <div className="flex gap-3">
                    {currentBrainstorm && (
                      <Button onClick={deleteBrainstorm} variant="ghost" size="sm" className="gap-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                        Banish
                      </Button>
                    )}
                    <Button onClick={() => saveBrainstorm(false)} size="sm" className="gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-success/20">
                      <Save className="h-4 w-4" />
                      Save Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-md border border-accent/20 glow-soft">
              <CardHeader className="border-b border-accent/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-accent">
                  <BookOpen className="h-5 w-5 text-warning flicker-candle" />
                  Premise Builder
                </CardTitle>
                <CardDescription className="text-accent/60">Weave your scattered ideas into a cohesive story premise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label htmlFor="logline" className="text-accent/80">Logline</Label>
                  <Input
                    id="logline"
                    value={logline}
                    onChange={(e) => {
                      setLogline(e.target.value);
                      handleAutoSave();
                    }}
                    placeholder="One sentence that captures your story's essence..."
                    className="bg-background/60 border-accent/20 focus:border-accent/50 focus:ring-accent/30 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="genre" className="text-accent/80">Genre</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => {
                        setGenre(e.target.value);
                        handleAutoSave();
                      }}
                      placeholder="Fantasy, Mystery..."
                      className="bg-background/60 border-accent/20 focus:border-accent/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tone" className="text-accent/80">Tone</Label>
                    <Input
                      id="tone"
                      value={tone}
                      onChange={(e) => {
                        setTone(e.target.value);
                        handleAutoSave();
                      }}
                      placeholder="Dark, Whimsical..."
                      className="bg-background/60 border-accent/20 focus:border-accent/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="themes" className="text-accent/80">Themes</Label>
                    <Input
                      id="themes"
                      value={themes}
                      onChange={(e) => {
                        setThemes(e.target.value);
                        handleAutoSave();
                      }}
                      placeholder="Redemption, Love..."
                      className="bg-background/60 border-accent/20 focus:border-accent/50"
                    />
                  </div>
                </div>

                <Separator className="my-6 bg-accent/10" />

                <Button onClick={graduateToProject} className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground border border-success/30 shadow-[0_0_15px_hsl(var(--success)/0.15)] transition-all py-6 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Graduate Idea to Project
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border border-accent/20 h-full">
              <CardHeader className="border-b border-accent/10 pb-4">
                <CardTitle className="text-lg text-accent flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Sparks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {brainstorms.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Sparkles className="h-12 w-12 text-accent/20 mx-auto mb-4" />
                    <p className="text-sm text-accent/60">No brainstorms yet. Conjure your first idea!</p>
                  </div>
                ) : (
                  brainstorms.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => loadBrainstorm(b)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                        currentBrainstorm?.id === b.id
                          ? 'bg-primary/20 border-success/40 shadow-[0_0_10px_hsl(var(--success)/0.1)]'
                          : 'bg-background/40 border-accent/10 hover:border-accent/30 hover:bg-background/60'
                      }`}
                    >
                      <p className={`text-sm font-medium line-clamp-2 ${currentBrainstorm?.id === b.id ? 'text-success-foreground text-glow' : 'text-foreground group-hover:text-accent'}`}>
                        {b.logline || b.ideas.substring(0, 60) + '...'}
                      </p>
                      <p className="text-xs text-accent/50 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning/50 group-hover:flicker-candle"></span>
                        {new Date(b.created).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySpark;