import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAutoSaveContext } from '@/contexts/AutoSaveContext.jsx';

const AutoSaveIndicator = () => {
  const { isSaving, globalError, lastSavedGlobal } = useAutoSaveContext();
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSavedGlobal && !globalError) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSavedGlobal, globalError]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pointer-events-none">
      <AnimatePresence mode="wait">
        {globalError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-full shadow-lg text-sm font-medium pointer-events-auto"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Save failed. Retrying...</span>
          </motion.div>
        )}

        {!globalError && isSaving && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 bg-card text-muted-foreground rounded-full shadow-lg border text-sm font-medium"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Saving...</span>
          </motion.div>
        )}

        {!globalError && !isSaving && showSaved && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full shadow-lg text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoSaveIndicator;