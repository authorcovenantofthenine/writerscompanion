import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit2, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const WorldPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [elements, setElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('location');

  const [formData, setFormData] = useState({
    title: '',
    type: 'location',
    content: '',
    category: ''
  });

  const fetchElements = async () => {
    if (!currentProject) {
      setElements([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const records = await pb.collection('world_elements').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setElements(records);
    } catch (error) {
      console.error('Error fetching world elements:', error);
      toast.error('Failed to load world elements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, [currentProject]);

  const handleOpenCreate = () => {
    setEditingElement(null);
    setFormData({ title: '', type: activeTab, content: '', category: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (element) => {
    setEditingElement(element);
    setFormData({
      title: element.title,
      type: element.type,
      content: element.content,
      category: element.category
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingElement) {
        await pb.collection('world_elements').update(editingElement.id, formData, { $autoCancel: false });
        toast.success('Element updated successfully');
      } else {
        await pb.collection('world_elements').create({
          ...formData,
          projectId: currentProject.id,
          userId: currentUser.id,
        }, { $autoCancel: false });
        toast.success('Element created successfully');
      }
      await fetchElements();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving element:', error);
      toast.error('Failed to save element.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this element?')) return;
    try {
      await pb.collection('world_elements').delete(id, { $autoCancel: false });
      toast.success('Element deleted');
      await fetchElements();
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Failed to delete element.');
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Globe className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">Please select a project to manage worldbuilding.</p>
        </div>
      </AppLayout>
    );
  }

  const filteredElements = elements.filter(e => e.type === activeTab);

  return (
    <AppLayout>
      <Helmet>
        <title>Worldbuilding - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gold-gradient">Worldbuilding</h1>
            <p className="text-muted-foreground mt-1">Manage locations, lore, magic, and cultures.</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Element
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="location">Locations</TabsTrigger>
            <TabsTrigger value="lore">Lore</TabsTrigger>
            <TabsTrigger value="magic">Magic Systems</TabsTrigger>
            <TabsTrigger value="culture">Cultures</TabsTrigger>
            <TabsTrigger value="detail">Details</TabsTrigger>
          </TabsList>

          {['location', 'lore', 'magic', 'culture', 'detail'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
                </div>
              ) : filteredElements.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <CardTitle className="mb-2">No {tabValue} elements yet</CardTitle>
                  <Button variant="outline" onClick={handleOpenCreate} className="mt-4">Create {tabValue}</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElements.map((element) => (
                    <Card key={element.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{element.title}</CardTitle>
                            {element.category && <Badge variant="secondary" className="mt-2">{element.category}</Badge>}
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(element)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(element.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{element.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingElement ? 'Edit Element' : 'Create New Element'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title / Name</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="lore">Lore</SelectItem>
                      <SelectItem value="magic">Magic System</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="detail">Detail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category (Optional)</Label>
                  <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Region, Era" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description / Content</Label>
                <Textarea rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
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
      </div>
    </AppLayout>
  );
};

export default WorldPage;