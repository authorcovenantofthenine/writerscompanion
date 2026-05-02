import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, ArrowRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useProjectContext } from '@/hooks/useProjectContext.js';

const CrossLinkManager = () => {
  const { activeProject } = useProjectContext();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProject) return;

    const fetchLinks = async () => {
      try {
        const records = await pb.collection('cross_links').getFullList({
          filter: `projectId = "${activeProject.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setLinks(records);
      } catch (error) {
        console.error('Error fetching cross links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [activeProject]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading connections...</div>;

  if (links.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-border rounded-xl bg-muted/10">
        <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Cross-Links Yet</h3>
        <p className="text-muted-foreground">Connect your notes, characters, and locations to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map(link => (
        <Card key={link.id} className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-medium text-foreground">{link.sourceNoteId}</div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="font-medium text-foreground">{link.targetNoteId}</div>
            </div>
            <Badge variant="secondary" className="capitalize">
              {link.linkType.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CrossLinkManager;