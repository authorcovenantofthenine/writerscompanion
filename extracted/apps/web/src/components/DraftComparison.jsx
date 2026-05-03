import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';

// Word-level diff algorithm
const generateWordDiff = (oldText, newText) => {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  
  const diff = [];
  let i = 0, j = 0;
  
  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      diff.push({ type: 'added', word: newWords[j] });
      j++;
    } else if (j >= newWords.length) {
      diff.push({ type: 'removed', word: oldWords[i] });
      i++;
    } else if (oldWords[i] === newWords[j]) {
      diff.push({ type: 'unchanged', word: oldWords[i] });
      i++;
      j++;
    } else {
      // Look ahead to find matches
      let foundInNew = newWords.slice(j).indexOf(oldWords[i]);
      let foundInOld = oldWords.slice(i).indexOf(newWords[j]);
      
      if (foundInNew !== -1 && (foundInOld === -1 || foundInNew < foundInOld)) {
        // Word was added in new version
        diff.push({ type: 'added', word: newWords[j] });
        j++;
      } else if (foundInOld !== -1) {
        // Word was removed from old version
        diff.push({ type: 'removed', word: oldWords[i] });
        i++;
      } else {
        // Both changed, mark as removed then added
        diff.push({ type: 'removed', word: oldWords[i] });
        diff.push({ type: 'added', word: newWords[j] });
        i++;
        j++;
      }
    }
  }
  
  return diff;
};

const DiffText = ({ diff }) => {
  return (
    <div className="prose prose-invert max-w-none leading-relaxed">
      {diff.map((item, index) => {
        if (item.type === 'added') {
          return (
            <span key={index} className="bg-green-500/20 text-green-300 rounded px-0.5">
              {item.word}
            </span>
          );
        } else if (item.type === 'removed') {
          return (
            <span key={index} className="bg-red-500/20 text-red-300 line-through rounded px-0.5">
              {item.word}
            </span>
          );
        } else {
          return <span key={index}>{item.word}</span>;
        }
      })}
    </div>
  );
};

const DraftComparison = ({ currentScene, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (currentScene) {
      fetchVersions();
    }
  }, [currentScene]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const records = await pb.collection('version_history').getFullList({
        filter: `noteId = "${currentScene.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      
      setVersions(records);
      if (records.length > 0) {
        setSelectedVersionId(records[0].id);
        setSelectedVersion(records[0]);
      }
    } catch (error) {
      console.error('Error fetching version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionChange = (versionId) => {
    setSelectedVersionId(versionId);
    const version = versions.find(v => v.id === versionId);
    setSelectedVersion(version);
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;
    
    try {
      setIsRestoring(true);
      
      const restoredContent = selectedVersion.previousContent;
      const plainText = restoredContent.replace(/<[^>]*>?/gm, '');
      const newWordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      await pb.collection('scenes').update(currentScene.id, {
        content: restoredContent,
        wordCount: newWordCount
      }, { $autoCancel: false });
      
      toast.success('Version restored successfully');
      onClose();
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentScene) return null;

  const currentContent = currentScene.content || '';
  const versionContent = selectedVersion?.previousContent || '';
  
  // Strip HTML for diff comparison
  const currentPlainText = currentContent.replace(/<[^>]*>?/gm, '');
  const versionPlainText = versionContent.replace(/<[^>]*>?/gm, '');
  
  const diff = generateWordDiff(versionPlainText, currentPlainText);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Compare Drafts</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedVersionId} onValueChange={handleVersionChange} disabled={isLoading || versions.length === 0}>
                <SelectTrigger className="w-[280px] bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {formatTimestamp(version.created)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading versions...</p>
              </div>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No version history</h3>
                <p className="text-muted-foreground">Start writing to create version snapshots</p>
              </div>
            </div>
          ) : (
            <>
              {/* Two-panel layout */}
              <div className="flex-1 grid grid-cols-2 gap-px bg-slate-800 overflow-hidden">
                {/* Left Panel - Selected Version */}
                <div className="bg-slate-950 flex flex-col">
                  <div className="p-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Previous Version</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedVersion && formatTimestamp(selectedVersion.created)}
                      </p>
                    </div>
                    <Button
                      onClick={handleRestore}
                      disabled={isRestoring || !selectedVersion}
                      className="gap-2"
                      variant="outline"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {isRestoring ? 'Restoring...' : 'Restore this version'}
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1 p-6">
                    <DiffText diff={diff.map(item => 
                      item.type === 'added' ? { ...item, type: 'unchanged' } : item
                    )} />
                  </ScrollArea>
                </div>

                {/* Right Panel - Current Version */}
                <div className="bg-slate-950 flex flex-col">
                  <div className="p-4 border-b border-slate-800 shrink-0">
                    <h3 className="font-semibold text-lg">Current Version</h3>
                    <p className="text-sm text-muted-foreground">Latest changes</p>
                  </div>
                  
                  <ScrollArea className="flex-1 p-6">
                    <DiffText diff={diff.map(item => 
                      item.type === 'removed' ? { ...item, type: 'unchanged' } : item
                    )} />
                  </ScrollArea>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded"></div>
                      <span>Added text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div>
                      <span>Removed text</span>
                    </div>
                  </div>
                  <p>{versions.length} {versions.length === 1 ? 'version' : 'versions'} available</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DraftComparison;