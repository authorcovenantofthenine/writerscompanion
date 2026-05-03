import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Settings, CheckCircle2, Loader2, GitCompare } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';

const ManuscriptTopBar = ({ 
  saveStatus, 
  isFocusMode, 
  toggleFocusMode,
  currentScene,
  onOpenComparison
}) => {
  const [hasVersionHistory, setHasVersionHistory] = useState(false);
  const [isCheckingVersions, setIsCheckingVersions] = useState(false);

  useEffect(() => {
    if (currentScene?.id) {
      checkVersionHistory();
    } else {
      setHasVersionHistory(false);
    }
  }, [currentScene?.id]);

  const checkVersionHistory = async () => {
    if (!currentScene?.id) return;
    
    try {
      setIsCheckingVersions(true);
      const result = await pb.collection('version_history').getList(1, 1, {
        filter: `noteId = "${currentScene.id}"`,
        $autoCancel: false
      });
      
      setHasVersionHistory(result.totalItems > 0);
    } catch (error) {
      console.error('Error checking version history:', error);
      setHasVersionHistory(false);
    } finally {
      setIsCheckingVersions(false);
    }
  };

  const isCompareDisabled = !currentScene || !hasVersionHistory || isCheckingVersions;

  return (
    <div className="h-14 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Saved</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span>Unsaved changes</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-2" 
                onClick={onOpenComparison}
                disabled={isCompareDisabled}
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Compare Drafts</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {!currentScene 
                  ? 'Select a scene to compare versions' 
                  : !hasVersionHistory 
                    ? 'No version history available yet' 
                    : 'Compare current draft with previous versions'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={toggleFocusMode}
          title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" title="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ManuscriptTopBar;