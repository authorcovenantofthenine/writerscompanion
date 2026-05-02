import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, BookOpen, FileText, Download, Lock, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb.jsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.jsx";
import { exportToDOCX, exportToPDF } from '@/lib/ExportService.js';

const BooksPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const { canAccess } = useFeatureAccess();
  const canAccessWordPdfExport = canAccess('export_formats');
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [chaptersByBook, setChaptersByBook] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const fetchData = async () => {
    if (!currentProject) {
      setBooks([]);
      setChaptersByBook({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [bookRecords, chapterRecords] = await Promise.all([
        pb.collection('books').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'created',
          $autoCancel: false,
        }),
        pb.collection('chapters').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'chapter_number,created',
          $autoCancel: false,
        })
      ]);
      
      setBooks(bookRecords);
      
      const grouped = {};
      chapterRecords.forEach(ch => {
        if (!grouped[ch.book_id]) grouped[ch.book_id] = [];
        grouped[ch.book_id].push(ch);
      });
      setChaptersByBook(grouped);
      
    } catch (error) {
      console.error('Error fetching books and chapters:', error);
      toast.error('Failed to load books.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  const handleOpenCreate = () => {
    setEditingBook(null);
    setFormData({ title: '', description: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (book, e) => {
    if (e) e.stopPropagation();
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBook) {
        await pb.collection('books').update(editingBook.id, formData, { $autoCancel: false });
        toast.success('Book updated');
      } else {
        await pb.collection('books').create({
          ...formData,
          projectId: currentProject.id,
          userId: currentUser.id,
        }, { $autoCancel: false });
        toast.success('Book created');
      }
      await fetchData();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this book? All associated chapters will remain but lose their book reference.')) return;
    try {
      await pb.collection('books').delete(id, { $autoCancel: false });
      toast.success('Book deleted');
      await fetchData();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book.');
    }
  };

  const handleTextExport = async () => {
    try {
      toast.loading('Generating manuscript...', { id: 'export' });
      
      // Fetch all scenes for this project
      const scenes = await pb.collection('scenes').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: 'order,created',
        $autoCancel: false
      });

      if (scenes.length === 0) {
        toast.error('No scenes found to export.', { id: 'export' });
        return;
      }

      let content = `${currentProject.name.toUpperCase()}\n\n`;
      
      // Group scenes by chapter
      const scenesByChapter = {};
      scenes.forEach(scene => {
        if (!scenesByChapter[scene.chapter_id]) scenesByChapter[scene.chapter_id] = [];
        scenesByChapter[scene.chapter_id].push(scene);
      });

      // Build text content
      for (const book of books) {
        content += `\n\n=== BOOK: ${book.title.toUpperCase()} ===\n\n`;
        const bookChapters = chaptersByBook[book.id] || [];
        
        for (const chapter of bookChapters) {
          content += `\n\n--- Chapter ${chapter.chapter_number}: ${chapter.title} ---\n\n`;
          const chapterScenes = scenesByChapter[chapter.id] || [];
          
          for (const scene of chapterScenes) {
            // Strip HTML tags from rich text content for plain text export
            const plainText = scene.content ? scene.content.replace(/<[^>]*>?/gm, '') : '';
            content += `\n${scene.title}\n\n${plainText}\n\n* * *\n`;
          }
        }
      }

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_manuscript.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export complete!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export manuscript.', { id: 'export' });
    }
  };

  const handlePremiumExport = async (format) => {
    if (!canAccessWordPdfExport) {
      setShowExportGate(true);
      return;
    }

    if (format === 'ePub') {
      toast.info('ePub export is coming soon!');
      return;
    }

    try {
      toast.loading(`Generating ${format} manuscript...`, { id: 'export' });

      // Fetch all scenes for this project
      const scenes = await pb.collection('scenes').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: 'order,created',
        $autoCancel: false
      });

      if (scenes.length === 0) {
        toast.error('No scenes found to export.', { id: 'export' });
        return;
      }

      // Group scenes by chapter
      const scenesByChapter = {};
      scenes.forEach(scene => {
        if (!scenesByChapter[scene.chapter_id]) scenesByChapter[scene.chapter_id] = [];
        scenesByChapter[scene.chapter_id].push(scene);
      });

      const manuscriptData = {
        project: currentProject,
        books,
        chaptersByBook,
        scenesByChapter
      };

      let blob;
      let extension;

      if (format === 'Word') {
        blob = await exportToDOCX(manuscriptData);
        extension = 'docx';
      } else if (format === 'PDF') {
        blob = await exportToPDF(manuscriptData);
        extension = 'pdf';
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName}_manuscript.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`${format} export complete!`, { id: 'export' });
      }
    } catch (error) {
      console.error(`${format} Export error:`, error);
      toast.error(`Failed to export ${format} manuscript.`, { id: 'export' });
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Books - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Books</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Books / Volumes</h1>
            <p className="text-muted-foreground mt-1">Organize your project into distinct books and chapters.</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleTextExport}>
                  Plain Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePremiumExport('Word')} className="flex justify-between items-center" disabled={!canAccessWordPdfExport}>
                  Word (.docx) {!canAccessWordPdfExport && <Lock className="w-3 h-3 text-muted-foreground"/>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePremiumExport('PDF')} className="flex justify-between items-center" disabled={!canAccessWordPdfExport}>
                  PDF Document {!canAccessWordPdfExport && <Lock className="w-3 h-3 text-muted-foreground"/>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePremiumExport('ePub')} className="flex justify-between items-center" disabled={!canAccessWordPdfExport}>
                  ePub Format {!canAccessWordPdfExport && <Lock className="w-3 h-3 text-muted-foreground"/>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Book
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : books.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No books yet</h3>
            <Button onClick={handleOpenCreate} className="mt-4">Create Book</Button>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {books.map((book) => {
              const bookChapters = chaptersByBook[book.id] || [];
              return (
                <AccordionItem key={book.id} value={book.id} className="border rounded-xl bg-card overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{book.title}</h3>
                          <p className="text-sm text-muted-foreground font-normal">
                            {bookChapters.length} {bookChapters.length === 1 ? 'Chapter' : 'Chapters'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleOpenEdit(book, e)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(book.id, e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 border-t border-border/50 bg-muted/10">
                    {book.description && (
                      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{book.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-foreground">Chapters</h4>
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <Link to={`/app/chapters?book=${book.id}`}>Manage Chapters</Link>
                        </Button>
                      </div>
                      
                      {bookChapters.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
                          No chapters in this book yet.
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {bookChapters.map(chapter => (
                            <Link 
                              key={chapter.id} 
                              to={`/app/chapters/${chapter.id}`}
                              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground font-mono text-sm w-6 text-right">{chapter.chapter_number}.</span>
                                <span className="font-medium group-hover:text-primary transition-colors">{chapter.title}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{chapter.word_count || 0} words</span>
                                <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Create Book'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Book Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportGate} onOpenChange={setShowExportGate}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
            <PremiumFeatureGate
              forceLock={true}
              featureName="Advanced Export Formats"
              featureDescription="Word, PDF, and ePub export are premium features. Upgrade to unlock all export formats. Free users can export to plain text."
            >
              <div />
            </PremiumFeatureGate>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default BooksPage;