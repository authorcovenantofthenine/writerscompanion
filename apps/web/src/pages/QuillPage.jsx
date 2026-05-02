
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Sparkles, Lightbulb, PenTool, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AIAssistant from '@/components/AIAssistant.jsx';
import RateLimitMessage from '@/components/RateLimitMessage.jsx';
import useAIRateLimit from '@/hooks/useAIRateLimit.js';

const QuillPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const [prompts, setPrompts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const { isRateLimited, checkError, clearRateLimit } = useAIRateLimit();

  const fetchData = async () => {
    if (!currentProject) {
      setPrompts([]);
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [promptRecords, suggRecords] = await Promise.all([
        pb.collection('writing_prompts').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: '-created',
          $autoCancel: false
        }), 
        pb.collection('writing_suggestions').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: '-created',
          $autoCancel: false
        })
      ]);
      setPrompts(promptRecords);
      setSuggestions(suggRecords);
    } catch (error) {
      console.error('Error fetching AI data:', error);
      toast.error('Failed to load Quill data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    clearRateLimit();
    try {
      // Mock AI generation for legacy tools
      await new Promise(resolve => setTimeout(resolve, 1500));
      await pb.collection('writing_prompts').create({
        title: 'The Forgotten Heirloom',
        description: 'A character discovers an object that proves their lineage to a fallen empire, but it carries a deadly curse.',
        category: 'Plot Hook',
        projectId: currentProject.id,
        userId: currentUser.id
      }, {
        $autoCancel: false
      });
      toast.success('New prompt generated!');
      await fetchData();
    } catch (error) {
      if (!checkError(error)) {
        toast.error('Failed to generate prompt.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    clearRateLimit();
    try {
      // Mock AI generation for legacy tools
      await new Promise(resolve => setTimeout(resolve, 1500));
      await pb.collection('writing_suggestions').create({
        suggestion_text: 'Consider increasing the pacing in the middle act by introducing a secondary antagonist.',
        context: 'Overall Plot Structure',
        type: 'Pacing',
        projectId: currentProject.id,
        userId: currentUser.id
      }, {
        $autoCancel: false
      });
      toast.success('New suggestion received!');
      await fetchData();
    } catch (error) {
      if (!checkError(error)) {
        toast.error('Failed to get suggestions.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Quill AI - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <AIAssistant 
        initialContext={`Project: ${currentProject.name}\nGenre: ${currentProject.genre || 'Fiction'}`} 
        onApply={text => {
          navigator.clipboard.writeText(text);
          toast.success('Content copied to clipboard! Ready to paste into your editor.');
        }} 
        open={isAssistantOpen} 
        onOpenChange={setIsAssistantOpen} 
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" /> Quil AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Your intelligent co-writer and brainstorming partner.</p>
        </div>

        <RateLimitMessage isVisible={isRateLimited} onDismiss={clearRateLimit} />

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tools">Legacy Tools</TabsTrigger>
            <TabsTrigger value="prompts">Saved Prompts</TabsTrigger>
            <TabsTrigger value="suggestions">Saved Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Brainstorming</CardTitle>
                  <CardDescription>Generate ideas for plots, characters, and settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleGeneratePrompt} disabled={isGenerating || isRateLimited}>
                    {isGenerating ? 'Thinking...' : 'Generate Ideas'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5 text-primary" /> Editing Suggestions</CardTitle>
                  <CardDescription>Get feedback on pacing, tone, and structure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleGetSuggestions} disabled={isGenerating || isRateLimited}>
                    {isGenerating ? 'Analyzing...' : 'Analyze Project'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleGeneratePrompt} disabled={isGenerating || isRateLimited}>
                <Wand2 className="mr-2 h-4 w-4" /> Generate Prompt
              </Button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
              </div>
            ) : prompts.length === 0 ? (
              <Card className="py-12 text-center border-dashed">
                <p className="text-muted-foreground">No prompts generated yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prompts.map(prompt => (
                  <Card key={prompt.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <CardDescription>{prompt.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{prompt.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleGetSuggestions} disabled={isGenerating || isRateLimited}>
                <Wand2 className="mr-2 h-4 w-4" /> Get Suggestions
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : suggestions.length === 0 ? (
              <Card className="py-12 text-center border-dashed">
                <p className="text-muted-foreground">No suggestions available.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions.map(sugg => (
                  <Card key={sugg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{sugg.type}</Badge>
                        <span className="text-xs text-muted-foreground">{sugg.context}</span>
                      </div>
                      <p className="text-sm">{sugg.suggestion_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default QuillPage;
