import React, { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen, Edit2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import ScenesList from './ScenesList.jsx';

export default function ChapterDetailView({ chapterId, onBack, onEdit }) {
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      setIsLoading(true);
      try {
        const record = await pb.collection('chapters').getOne(chapterId, { $autoCancel: false });
        setChapter(record);
      } catch (error) {
        console.error('Error fetching chapter details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chapter not found.</p>
        <Button variant="link" onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground -ml-3">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Chapters
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(chapter)}>
          <Edit2 className="mr-2 h-4 w-4" /> Edit Chapter
        </Button>
      </div>

      <Card className="border-primary/10 shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-primary/80">
                Chapter {chapter.chapter_number}
              </CardDescription>
              <CardTitle className="text-2xl font-serif">{chapter.title}</CardTitle>
            </div>
          </div>
          {chapter.summary && (
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-3xl">
              {chapter.summary}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold tracking-tight">Scenes</h3>
            <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
              {chapter.word_count || 0} words total
            </span>
          </div>
          
          <ScenesList chapterId={chapter.id} />
        </CardContent>
      </Card>
    </div>
  );
}