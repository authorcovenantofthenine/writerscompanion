import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, Download, Lock, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import AppLayout from '@/components/AppLayout.jsx';
import PremiumFeatureGate from '@/components/PremiumFeatureGate.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb.jsx";
import ChapterDetailView from '@/components/ChapterDetailView.jsx';

const ChaptersPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const { canAccess } = useFeatureAccess();
  const canAccessWordPdfExport = canAccess('export_formats');
  
  const [searchParams] = useSearchParams();
  const bookFilter = searchParams.get('book');
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [chapters, setChapters] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    summary: '',
    book_id: bookFilter || ''
  });

  const fetchData = async () => {
    if (!currentProject) {
      setChapters([]);
      setBooks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let filterStr = `projectId = "${currentProject.id}"`;
      if (bookFilter) {
        filterStr += ` && book_id = "${bookFilter}"`;
      }

      const [chapRecords, bookRecords] = await Promise.all([
        pb.collection('chapters').getFullList({
          filter: filterStr,
          sort: 'chapter_number,created',
          $autoCancel: false,
        }),
        pb.collection('books').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          sort: 'created',
          $autoCancel: false,
        })
      ]);
      setChapters(chapRecords);
      setBooks(bookRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load chapters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProject, bookFilter]);

  const handleOpenCreate = () => {
    setEditingChapter(null);
    setFormData({ 
      chapter_number: chapters.length + 1, 
      title: '', 
      summary: '', 
      book_id: bookFilter || (books.length > 0 ? books[0].id : '') 
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      chapter_number: chapter.chapter_number || '',
      title: chapter.title,
      summary: chapter.summary,
      book_id: chapter.book_id
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        chapter_number: parseInt(formData.chapter_number) || 0
      };

      if (editingChapter) {
        await pb.collection('chapters').update(editingChapter.id, dataToSave, { $autoCancel: false });
        toast.success('Chapter updated');
      } else {
        await pb.collection('chapters').create({
          ...dataToSave,
          projectId: currentProject.id,
          userId: currentUser.id,
          word_count: 0
        }, { $autoCancel: false });
        toast.success('Chapter created');
      }
      await fetchData();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Failed to save chapter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chapter? All nested scenes will be orphaned.')) return;
    try {
      await pb.collection('chapters').delete(id, { $autoCancel: false });
      toast.success('Chapter deleted');
      if (chapterId === id) {
        navigate('/app/chapters');
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter.');
    }
  };

  const handlePremiumExport = (format) => {
    if (!canAccessWordPdfExport) {
      setShowExportGate(true);
      return;
    }
    toast.success(`Exporting to ${format}...`);
  };

  const getBookName = (id) => {
    const book = books.find(b => b.id === id);
    return book ? book.title : 'Unassigned';
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        </div>
      </AppLayout>
    );
  }

  // If a specific chapter is selected, show the detail view
  if (chapterId) {
    const activeChapter = chapters.find(c => c.id === chapterId);
    const activeBook = activeChapter ? books.find(b => b.id === activeChapter.book_id) : null;

    return (
      <AppLayout>
        <Helmet>
          <title>{activeChapter ? activeChapter.title : 'Chapter'} - {currentProject.name} - Quil Forge</title>
        </Helmet>
        <div className="max-w-5xl mx-auto space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/app/projects">Projects</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/app/projects/books">Books</Link></BreadcrumbLink>
              </BreadcrumbItem>
              {activeBook && (
                <>
                  <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to={`/app/chapters?book=${activeBook.id}`}>{activeBook.title}</Link></BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{activeChapter ? activeChapter.title : 'Chapter Details'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <ChapterDetailView 
            chapterId={chapterId} 
            onBack={() => navigate(bookFilter ? `/app/chapters?book=${bookFilter}` : '/app/chapters')}
            onEdit={handleOpenEdit}
          />
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Chapter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>Number</Label>
                  <Input type="number" required value={formData.chapter_number} onChange={e => setFormData({...formData, chapter_number: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Book</Label>
                <Select value={formData.book_id} onValueChange={v => setFormData({...formData, book_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Book" /></SelectTrigger>
                  <SelectContent>
                    {books.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.book_id}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AppLayout>
    );
  }

  // Otherwise, show the list of chapters
  return (
    <AppLayout>
      <Helmet>
        <title>Chapters - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/app/projects">Projects</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/app/projects/books">Books</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Chapters</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chapters Overview</h1>
            <p className="text-muted-foreground mt-1">Manage chapters for your books.</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toast.success('Exporting to Plain Text...')}>
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
            <Button onClick={handleOpenCreate} disabled={books.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> New Chapter
            </Button>
          </div>
        </div>

        {books.length === 0 && !isLoading && (
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            You need to create a Book first before adding chapters. Go to the Books page.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : chapters.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No chapters found</h3>
            <Button onClick={handleOpenCreate} disabled={books.length === 0} className="mt-4">Create Chapter</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="group hover:shadow-md transition-all border-border/50">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <BookOpen className="h-4 w-4 text-primary/70" />
                      <span>{getBookName(chapter.book_id)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenEdit(chapter); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDelete(chapter.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <Link to={`/app/chapters/${chapter.id}`} className="block group-hover:text-primary transition-colors">
                    <h3 className="text-lg font-semibold mb-1">
                      <span className="text-muted-foreground mr-2">{chapter.chapter_number}.</span>
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {chapter.summary || 'No summary provided.'}
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <span>{chapter.word_count || 0} words</span>
                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                      <Link to={`/app/chapters/${chapter.id}`}>View Scenes <ChevronRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Create Chapter'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>Number</Label>
                  <Input type="number" required value={formData.chapter_number} onChange={e => setFormData({...formData, chapter_number: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Book</Label>
                <Select value={formData.book_id} onValueChange={v => setFormData({...formData, book_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Book" /></SelectTrigger>
                  <SelectContent>
                    {books.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.book_id}>
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

export default ChaptersPage;