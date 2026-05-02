import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import DialogueSnippetForm from '@/components/DialogueSnippetForm.jsx';
import VoiceNoteRecorder from '@/components/VoiceNoteRecorder.jsx';
import InspirationBoardForm from '@/components/InspirationBoardForm.jsx';
import NameGeneratorTool from '@/components/NameGeneratorTool.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useProjectContext } from '@/hooks/useProjectContext.js';
import HomeButton from '@/components/HomeButton.jsx';

const WritingReferencesPage = () => {
  const { activeProject } = useProjectContext();
  const [snippets, setSnippets] = useState([]);
  const [inspirations, setInspirations] = useState([]);

  const fetchData = async () => {
    if (!activeProject) return;
    try {
      const [snips, insp] = await Promise.all([
        pb.collection('dialogue_snippets').getFullList({ filter: `projectId="${activeProject.id}"`, sort: '-created', $autoCancel: false }),
        pb.collection('inspiration_board').getFullList({ filter: `projectId="${activeProject.id}"`, sort: '-created', $autoCancel: false })
      ]);
      setSnippets(snips);
      setInspirations(insp);
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProject]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <Helmet>
        <title>Writing References - Quil Forge</title>
      </Helmet>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Writing References</h1>
          <p className="text-muted-foreground">Manage your dialogue snippets, voice notes, and inspiration boards.</p>
        </div>
        <HomeButton />
      </div>

      <Tabs defaultValue="dialogue" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dialogue"><MessageSquare className="w-4 h-4 mr-2" /> Dialogue</TabsTrigger>
          <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-2" /> Voice Notes</TabsTrigger>
          <TabsTrigger value="inspiration"><ImageIcon className="w-4 h-4 mr-2" /> Inspiration</TabsTrigger>
          <TabsTrigger value="names"><Sparkles className="w-4 h-4 mr-2" /> Names</TabsTrigger>
        </TabsList>

        <TabsContent value="dialogue" className="space-y-6">
          <DialogueSnippetForm onSuccess={fetchData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {snippets.map(snippet => (
              <Card key={snippet.id} className="bg-card">
                <CardContent className="p-5">
                  <div className="font-semibold text-primary mb-1">{snippet.characterName}</div>
                  {snippet.context && <div className="text-xs text-muted-foreground mb-3 italic">{snippet.context}</div>}
                  <p className="text-foreground">"{snippet.dialogueText}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voice">
          <VoiceNoteRecorder onSuccess={fetchData} />
        </TabsContent>

        <TabsContent value="inspiration" className="space-y-6">
          <InspirationBoardForm onSuccess={fetchData} />
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mt-8">
            {inspirations.map(item => (
              <Card key={item.id} className="bg-card break-inside-avoid">
                {item.type === 'image' && item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-cover rounded-t-xl" />
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  {item.content && <p className="text-sm text-muted-foreground">{item.content}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="names">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Name Generator</h2>
            <NameGeneratorTool />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WritingReferencesPage;