import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileText, Edit2, Trash2, Type } from 'lucide-react';
import { format } from 'date-fns';

const ManuscriptCard = ({ manuscript, onEdit, onDelete, onRename }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(manuscript.title);

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle !== manuscript.title) {
      onRename(manuscript.id, newTitle.trim());
    }
    setIsRenameDialogOpen(false);
  };

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200 group">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
            {manuscript.title || 'Untitled Manuscript'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Template: {manuscript.template_id ? 'Custom Template' : 'Default'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span>Word Count: {manuscript.content ? manuscript.content.split(/\s+/).length : 0}</span>
          </div>
          <div className="text-xs pt-2">
            Last edited: {format(new Date(manuscript.updated), 'MMM d, yyyy h:mm a')}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t flex justify-between gap-2">
          <Button variant="default" size="sm" className="flex-1" onClick={() => onEdit(manuscript.id)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(true)}>
            Rename
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manuscript</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{manuscript.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              onDelete(manuscript.id);
              setIsDeleteDialogOpen(false);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Manuscript</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="Manuscript Title"
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManuscriptCard;