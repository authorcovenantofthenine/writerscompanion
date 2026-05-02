import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RotateCcw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProjectContext } from '@/hooks/useProjectContext.js';
import { format } from 'date-fns';

const VersionHistoryViewer = ({ noteId }) => {
  const { activeProject } = useProjectContext();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProject || !noteId) return;

    const fetchVersions = async () => {
      try {
        const records = await pb.collection('version_history').getFullList({
          filter: `projectId = "${activeProject.id}" && noteId = "${noteId}"`,
          sort: '-timestamp',
          $autoCancel: false
        });
        setVersions(records);
      } catch (error) {
        console.error('Error fetching versions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [activeProject, noteId]);

  if (!noteId) return <div className="p-4 text-muted-foreground">Select a note to view its history.</div>;
  if (loading) return <div className="p-4 text-muted-foreground">Loading history...</div>;

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {versions.map((version, idx) => (
        <div key={version.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            <History className="w-4 h-4 text-muted-foreground" />
          </div>
          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-foreground">
                  {format(new Date(version.timestamp), 'MMM d, yyyy HH:mm')}
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" /> Restore
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {version.changeDescription || 'Auto-saved version'}
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
      {versions.length === 0 && (
        <div className="text-center p-8 text-muted-foreground relative z-10 bg-background">
          No version history found for this note.
        </div>
      )}
    </div>
  );
};

export default VersionHistoryViewer;