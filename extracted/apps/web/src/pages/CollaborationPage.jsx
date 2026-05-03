import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, History } from 'lucide-react';
import VersionHistoryViewer from '@/components/VersionHistoryViewer.jsx';
import HomeButton from '@/components/HomeButton.jsx';

const CollaborationPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <Helmet>
        <title>Collaboration - Quil Forge</title>
      </Helmet>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Collaboration & History</h1>
          <p className="text-muted-foreground">Work with co-authors, manage feedback, and track changes.</p>
        </div>
        <HomeButton />
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" /> History</TabsTrigger>
          <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-2" /> Comments</TabsTrigger>
          <TabsTrigger value="share"><Users className="w-4 h-4 mr-2" /> Share</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Project Timeline</h2>
            <VersionHistoryViewer noteId="project-wide" />
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Feedback & Comments</h3>
            <p className="text-muted-foreground">Review notes and suggestions from your beta readers and co-authors.</p>
          </div>
        </TabsContent>

        <TabsContent value="share">
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Share Project</h3>
            <p className="text-muted-foreground">Invite others to view or comment on your world grimoire.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPage;