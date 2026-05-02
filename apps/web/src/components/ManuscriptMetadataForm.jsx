import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ManuscriptMetadataForm = ({ projectId, onMetadataChange }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    bookTitle: '',
    authorName: '',
    authorEmail: ''
  });
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const records = await pb.collection('manuscript_metadata').getFullList({
          filter: `projectId="${projectId}"`,
          $autoCancel: false
        });
        
        if (records.length > 0) {
          const record = records[0];
          setRecordId(record.id);
          const newFormData = {
            bookTitle: record.bookTitle || '',
            authorName: record.authorName || '',
            authorEmail: record.authorEmail || ''
          };
          setFormData(newFormData);
          
          if (record.coverImage) {
            setCoverPreview(pb.files.getUrl(record, record.coverImage));
          }
          
          onMetadataChange(newFormData);
        } else {
          onMetadataChange(formData);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onMetadataChange(newFormData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const data = new FormData();
      data.append('projectId', projectId);
      data.append('userId', currentUser.id);
      data.append('bookTitle', formData.bookTitle);
      data.append('authorName', formData.authorName);
      data.append('authorEmail', formData.authorEmail);
      
      if (coverFile) {
        data.append('coverImage', coverFile);
      }

      let savedRecord;
      if (recordId) {
        savedRecord = await pb.collection('manuscript_metadata').update(recordId, data, { $autoCancel: false });
      } else {
        savedRecord = await pb.collection('manuscript_metadata').create(data, { $autoCancel: false });
        setRecordId(savedRecord.id);
      }
      
      toast.success('Metadata saved successfully');
      onMetadataChange(formData);
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error('Failed to save metadata');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Book Metadata
        </CardTitle>
        <CardDescription>Essential details for your manuscript exports.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookTitle">Book Title</Label>
              <Input 
                id="bookTitle" 
                name="bookTitle" 
                value={formData.bookTitle} 
                onChange={handleChange} 
                placeholder="The Winds of Winter" 
                className="text-foreground"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input 
                  id="authorName" 
                  name="authorName" 
                  value={formData.authorName} 
                  onChange={handleChange} 
                  placeholder="Pen Name" 
                  className="text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Contact Email</Label>
                <Input 
                  id="authorEmail" 
                  name="authorEmail" 
                  type="email" 
                  value={formData.authorEmail} 
                  onChange={handleChange} 
                  placeholder="author@example.com" 
                  className="text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Cover Image (ePub/MOBI only)</Label>
              <div className="flex items-center gap-4">
                {coverPreview ? (
                  <div className="relative w-20 h-28 rounded overflow-hidden border border-border">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-28 rounded border border-dashed border-border flex items-center justify-center bg-muted/30">
                    <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                  </div>
                )}
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="cursor-pointer text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Recommended: 1600x2560px JPEG or PNG</p>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full mt-2">
            {isSaving ? 'Saving...' : (
              <><Save className="w-4 h-4 mr-2" /> Save Metadata</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManuscriptMetadataForm;