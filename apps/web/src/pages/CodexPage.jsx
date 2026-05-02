import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { 
  BookDashed, Plus, Trash2, Search, BookOpen, 
  Map, ScrollText, Users, Sparkles, X, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';

const CODEX_TABS = [
  { id: 'characters', label: 'Characters', icon: Users, collection: 'characters', typeFilter: null },
  { id: 'locations', label: 'Locations', icon: Map, collection: 'world_elements', typeFilter: 'location' },
  { id: 'lore', label: 'Lore & History', icon: ScrollText, collection: 'world_elements', typeFilter: 'lore' },
  { id: 'factions', label: 'Factions', icon: Shield, collection: 'world_elements', typeFilter: 'faction' },
  { id: 'magic', label: 'Magic & Rules', icon: Sparkles, collection: 'world_elements', typeFilter: 'magic' },
];

const CodexPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [activeTab, setActiveTab] = useState('characters');
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sheet state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [draftEntry, setDraftEntry] = useState(null);
  
  // Delete state
  const [entryToDelete, setEntryToDelete] = useState(null);

  const fetchEntries = async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      const tabConfig = CODEX_TABS.find(t => t.id === activeTab);
      
      let filterStr = `projectId = "${currentProject.id}"`;
      if (tabConfig.typeFilter) {
        filterStr += ` && type = "${tabConfig.typeFilter}"`;
      }

      const records = await pb.collection(tabConfig.collection).getFullList({
        filter: filterStr,
        sort: '-created',
        $autoCancel: false
      });
      
      setEntries(records);
    } catch (error) {
      console.error('Error fetching codex entries:', error);
      toast.error('Failed to load codex entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [activeTab, currentProject]);

  const handleOpenAdd = () => {
    const tabConfig = CODEX_TABS.find(t => t.id === activeTab);
    setIsAdding(true);
    
    if (tabConfig.collection === 'characters') {
      setDraftEntry({ name: '', role: '', description: '', appearance: '' });
    } else {
      setDraftEntry({ title: '', type: tabConfig.typeFilter, content: '', category: '' });
    }
    
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setIsAdding(false);
    setSelectedEntry(entry);
    setDraftEntry({ ...entry });
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedEntry(null);
    setDraftEntry(null);
    setIsAdding(false);
  };

  const handleDraftChange = (field, value) => {
    setDraftEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleDraftBlur = async (field, value) => {
    if (isAdding) return; // Don't auto-save while creating a new entry
    if (selectedEntry[field] === value) return; // No change

    const tabConfig = CODEX_TABS.find(t => t.id === activeTab);
    
    try {
      const updated = await pb.collection(tabConfig.collection).update(
        selectedEntry.id, 
        { [field]: value },
        { $autoCancel: false }
      );
      
      setSelectedEntry(updated);
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to save changes.');
      // Revert draft on failure
      setDraftEntry(prev => ({ ...prev, [field]: selectedEntry[field] }));
    }
  };

  const handleCreateSubmit = async () => {
    const tabConfig = CODEX_TABS.find(t => t.id === activeTab);
    
    // Basic validation
    if (tabConfig.collection === 'characters' && !draftEntry.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (tabConfig.collection === 'world_elements' && !draftEntry.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const payload = {
        ...draftEntry,
        projectId: currentProject.id,
        userId: currentUser.id
      };
      
      await pb.collection(tabConfig.collection).create(payload, { $autoCancel: false });
      toast.success('Entry created successfully.');
      handleSheetClose();
      fetchEntries();
    } catch (error) {
      console.error('Creation failed:', error);
      toast.error('Failed to create entry.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    
    const tabConfig = CODEX_TABS.find(t => t.id === activeTab);
    try {
      await pb.collection(tabConfig.collection).delete(entryToDelete.id, { $autoCancel: false });
      toast.success('Entry deleted.');
      setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
      if (selectedEntry?.id === entryToDelete.id) {
        handleSheetClose();
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      toast.error('Failed to delete entry.');
    } finally {
      setEntryToDelete(null);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = (entry.name || entry.title || '').toLowerCase();
    const desc = (entry.description || entry.content || '').toLowerCase();
    return name.includes(query) || desc.includes(query);
  });

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <BookDashed className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2 font-serif">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Open a project to access the Universal Codex.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Codex - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif flex items-center gap-3 text-gold-gradient">
              <BookOpen className="h-8 w-8 text-primary" />
              Universal Codex
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              The unified repository of characters, locations, and lore for {currentProject.name}.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-card/50 border border-border/50 p-1 mb-6 rounded-xl">
            {CODEX_TABS.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2.5 transition-all"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center space-x-2 mb-6 bg-card/40 border border-border/50 rounded-xl p-2 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search entries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="h-8 w-8 text-muted-foreground">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl bg-card/40" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-2xl bg-card/20">
                {React.createElement(CODEX_TABS.find(t => t.id === activeTab).icon, { 
                  className: "h-12 w-12 text-primary opacity-60 mb-4" 
                })}
                <h3 className="text-xl font-medium font-serif mb-2">No entries found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {searchQuery 
                    ? "Try adjusting your search terms." 
                    : `Your ${CODEX_TABS.find(t => t.id === activeTab).label.toLowerCase()} codex is empty. Add your first entry to begin.`}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenAdd} variant="outline" className="border-primary/50 hover:bg-primary/10">
                    Create Entry
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEntries.map(entry => {
                  const title = entry.name || entry.title;
                  const desc = entry.description || entry.content || 'No description provided.';
                  const isChar = activeTab === 'characters';
                  const subtitle = isChar ? entry.role : entry.category;

                  return (
                    <div 
                      key={entry.id} 
                      className="group flex flex-col bg-card/40 hover:bg-card/80 border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleOpenEdit(entry)}
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <h3 className="font-serif text-xl font-bold leading-tight line-clamp-2 text-foreground">
                            {title}
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEntryToDelete(entry);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {subtitle && (
                          <Badge variant="secondary" className="w-fit mb-3 bg-secondary/50 text-secondary-foreground font-medium">
                            {subtitle}
                          </Badge>
                        )}
                        
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mt-auto">
                          {desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto border-l-border/50 bg-background/95 backdrop-blur-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-serif text-2xl">
              {isAdding ? `New ${CODEX_TABS.find(t => t.id === activeTab).label.replace(/s$/, '')}` : (draftEntry?.name || draftEntry?.title)}
            </SheetTitle>
            <SheetDescription>
              {isAdding ? 'Fill in the details below to create a new entry.' : 'Changes are saved automatically as you type.'}
            </SheetDescription>
          </SheetHeader>

          {draftEntry && (
            <div className="space-y-6 pb-20">
              {activeTab === 'characters' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input 
                      value={draftEntry.name || ''} 
                      onChange={(e) => handleDraftChange('name', e.target.value)}
                      onBlur={(e) => handleDraftBlur('name', e.target.value)}
                      placeholder="e.g. Lyra Valerius"
                      className="bg-card/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role / Archetype</label>
                    <Input 
                      value={draftEntry.role || ''} 
                      onChange={(e) => handleDraftChange('role', e.target.value)}
                      onBlur={(e) => handleDraftBlur('role', e.target.value)}
                      placeholder="e.g. Protagonist, Rogue Mage"
                      className="bg-card/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Appearance</label>
                    <Textarea 
                      value={draftEntry.appearance || ''} 
                      onChange={(e) => handleDraftChange('appearance', e.target.value)}
                      onBlur={(e) => handleDraftBlur('appearance', e.target.value)}
                      placeholder="Physical description..."
                      className="min-h-[100px] bg-card/50 text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Biography & Personality</label>
                    <Textarea 
                      value={draftEntry.description || ''} 
                      onChange={(e) => handleDraftChange('description', e.target.value)}
                      onBlur={(e) => handleDraftBlur('description', e.target.value)}
                      placeholder="Backstory, traits, motivations..."
                      className="min-h-[200px] bg-card/50 text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input 
                      value={draftEntry.title || ''} 
                      onChange={(e) => handleDraftChange('title', e.target.value)}
                      onBlur={(e) => handleDraftBlur('title', e.target.value)}
                      placeholder="e.g. The Obsidian Spire"
                      className="bg-card/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category / Tags</label>
                    <Input 
                      value={draftEntry.category || ''} 
                      onChange={(e) => handleDraftChange('category', e.target.value)}
                      onBlur={(e) => handleDraftBlur('category', e.target.value)}
                      placeholder="e.g. Capital City, Ancient Myth"
                      className="bg-card/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Details</label>
                    <Textarea 
                      value={draftEntry.content || ''} 
                      onChange={(e) => handleDraftChange('content', e.target.value)}
                      onBlur={(e) => handleDraftBlur('content', e.target.value)}
                      placeholder="Describe this element in detail..."
                      className="min-h-[300px] bg-card/50 text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                </>
              )}

              {isAdding && (
                <div className="pt-4 flex gap-3">
                  <Button onClick={handleCreateSubmit} className="flex-1">
                    Create Entry
                  </Button>
                  <Button onClick={handleSheetClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete Codex Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{entryToDelete?.name || entryToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-foreground hover:bg-muted border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppLayout>
  );
};

export default CodexPage;