import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Trash2, Image as ImageIcon, File, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const AssetsPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'image',
    description: '',
    file: null
  });

  const fetchAssets = async () => {
    if (!currentProject) {
      setAssets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const records = await pb.collection('assets').getFullList({
        filter: `projectId = "${currentProject.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setAssets(records);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentProject]);

  const handleOpenCreate = () => {
    setFormData({ name: '', type: 'image', description: '', file: null });
    setIsFormOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('projectId', currentProject.id);
      data.append('userId', currentUser.id);
      data.append('file', formData.file);

      await pb.collection('assets').create(data, { $autoCancel: false });
      toast.success('Asset uploaded successfully');
      await fetchAssets();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error uploading asset:', error);
      toast.error('Failed to upload asset. Check file size (max 20MB).');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset permanently?')) return;
    try {
      await pb.collection('assets').delete(id, { $autoCancel: false });
      toast.success('Asset deleted');
      await fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset.');
    }
  };

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
        </div>
      </AppLayout>
    );
  }

  const filteredAssets = filterType === 'all' ? assets : assets.filter(a => a.type === filterType);

  return (
    <AppLayout>
      <Helmet>
        <title>Assets - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assets & References</h1>
            <p className="text-muted-foreground mt-1">Store images, maps, and research materials.</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Asset
          </Button>
        </div>

        <div className="flex space-x-2 mb-6">
          {['all', 'image', 'reference', 'research', 'resource'].map(type => (
            <Button 
              key={type} 
              variant={filterType === type ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : filteredAssets.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No assets found</h3>
            <Button onClick={handleOpenCreate} className="mt-4">Upload First Asset</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden group">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {asset.file ? (
                    <img 
                      src={pb.files.getUrl(asset, asset.file)} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-muted" style={{ display: asset.file ? 'none' : 'flex' }}>
                    <File className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(asset.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold truncate" title={asset.name}>{asset.name}</h4>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize mb-2">{asset.type}</Badge>
                  {asset.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{asset.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image / Map</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File (Max 20MB)</Label>
                <Input type="file" required onChange={handleFileChange} className="cursor-pointer" />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !formData.name.trim() || !formData.file}>
                  {isSubmitting ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AssetsPage;