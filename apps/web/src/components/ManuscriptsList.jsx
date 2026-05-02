import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import ManuscriptCard from './ManuscriptCard.jsx';
import ManuscriptFiltersBar from './ManuscriptFiltersBar.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

const ManuscriptsList = ({ onEditManuscript }) => {
  const { currentUser } = useAuth();
  const [manuscripts, setManuscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('-updated');

  const fetchManuscripts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const records = await pb.collection('manuscripts').getList(1, 100, {
        filter: `userId = "${currentUser.id}"`,
        sort: sortOption,
        $autoCancel: false
      });
      setManuscripts(records.items);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
      toast.error('Failed to load manuscripts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManuscripts();
  }, [currentUser, sortOption]);

  const handleDelete = async (id) => {
    try {
      await pb.collection('manuscripts').delete(id, { $autoCancel: false });
      setManuscripts(prev => prev.filter(m => m.id !== id));
      toast.success('Manuscript deleted successfully');
    } catch (error) {
      console.error('Error deleting manuscript:', error);
      toast.error('Failed to delete manuscript');
    }
  };

  const handleRename = async (id, newTitle) => {
    try {
      const updated = await pb.collection('manuscripts').update(id, { title: newTitle }, { $autoCancel: false });
      setManuscripts(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('Manuscript renamed successfully');
    } catch (error) {
      console.error('Error renaming manuscript:', error);
      toast.error('Failed to rename manuscript');
    }
  };

  const filteredManuscripts = manuscripts.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <ManuscriptFiltersBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        sortOption={sortOption} 
        setSortOption={setSortOption} 
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="pt-4 flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredManuscripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManuscripts.map(manuscript => (
            <ManuscriptCard 
              key={manuscript.id} 
              manuscript={manuscript} 
              onEdit={onEditManuscript}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
          <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No manuscripts found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery ? "No manuscripts match your search criteria." : "You haven't created any manuscripts yet. Start writing to see them here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManuscriptsList;