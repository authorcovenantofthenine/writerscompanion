import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const AutoSaveContext = createContext(null);

export const AutoSaveProvider = ({ children }) => {
  const [activeSaves, setActiveSaves] = useState(new Set());
  const [globalError, setGlobalError] = useState(null);
  const [lastSavedGlobal, setLastSavedGlobal] = useState(null);
  const timeoutsRef = useRef(new Map());

  const unregisterSave = useCallback((id) => {
    setActiveSaves(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLastSavedGlobal(Date.now());
    
    // Clear the safety timeout if it exists
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id));
      timeoutsRef.current.delete(id);
    }
  }, []);

  const registerSave = useCallback((id) => {
    setActiveSaves(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setGlobalError(null);

    // Safety timeout: force unregister after 15 seconds if it gets stuck
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id));
    }
    
    const timeout = setTimeout(() => {
      console.warn(`Auto-save for ${id} timed out. Forcing unregister to prevent stuck state.`);
      unregisterSave(id);
      setGlobalError('Save operation timed out. Please check your connection.');
    }, 15000);
    
    timeoutsRef.current.set(id, timeout);
  }, [unregisterSave]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
    };
  }, []);

  const isSaving = activeSaves.size > 0;

  return (
    <AutoSaveContext.Provider value={{ 
      isSaving, 
      registerSave, 
      unregisterSave, 
      globalError, 
      setGlobalError,
      lastSavedGlobal 
    }}>
      {children}
    </AutoSaveContext.Provider>
  );
};

export const useAutoSaveContext = () => {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error('useAutoSaveContext must be used within an AutoSaveProvider');
  }
  return context;
};