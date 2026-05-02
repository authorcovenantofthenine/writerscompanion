import { useState, useEffect, useRef, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAutoSaveContext } from '@/contexts/AutoSaveContext.jsx';
import { retryWithBackoff } from '@/lib/autoSaveManager.js';

export const useAutoSave = (collectionName, recordId, data, debounceMs = 1500, isDirty = true) => {
  const { registerSave, unregisterSave, setGlobalError } = useAutoSaveContext();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  const dataRef = useRef(data);
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);
  const pendingSaveRef = useRef(null);

  const performSave = async (col, id, payload, saveId) => {
    setIsSaving(true);
    registerSave(saveId);
    
    try {
      console.log(`[AutoSave] Initiating save to ${col}/${id} with payload:`, payload);
      
      // Use retry mechanism to ensure network blips don't cause permanent failure
      await retryWithBackoff(() => 
        pb.collection(col).update(id, payload, { $autoCancel: false })
      );
      
      console.log(`[AutoSave] Save successful for ${col}/${id}`);
      setLastSaved(Date.now());
      setError(null);
    } catch (err) {
      console.error(`[AutoSave] Error for ${col} (${id}):`, err);
      console.error(`[AutoSave] Status code:`, err.status);
      console.error(`[AutoSave] Response object:`, err.response);
      console.error(`[AutoSave] Validation data:`, err.response?.data);

      let errorMessage = 'Failed to save changes.';
      if (err.status === 403) {
        errorMessage = 'Permission denied. You may not have access to save this record.';
      } else if (err.status === 400) {
        errorMessage = 'Validation error. Invalid data provided for save.';
        // Extract specific validation errors if available
        if (err.response?.data) {
          const validationErrors = Object.entries(err.response.data)
            .map(([field, info]) => `${field}: ${info.message}`)
            .join(', ');
          if (validationErrors) errorMessage += ` (${validationErrors})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setGlobalError(errorMessage);
    } finally {
      setIsSaving(false);
      unregisterSave(saveId);
    }
  };

  const triggerSave = useCallback(async (overrideData = null) => {
    if (!recordId || !collectionName) return;
    const payload = overrideData || dataRef.current;
    const saveId = `${collectionName}-${recordId}`;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingSaveRef.current = null;
    
    await performSave(collectionName, recordId, payload, saveId);
  }, [collectionName, recordId, registerSave, unregisterSave, setGlobalError]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      dataRef.current = data;
      return;
    }

    // Deep compare to check if data actually changed
    if (JSON.stringify(dataRef.current) === JSON.stringify(data)) return;
    dataRef.current = data;

    // CRITICAL FIX: Only trigger auto-save if we have a valid record AND the state is marked as dirty (user initiated)
    if (!recordId || !collectionName || !isDirty) return;

    const saveId = `${collectionName}-${recordId}`;
    
    // Track the pending save so we can flush it on unmount
    pendingSaveRef.current = { collectionName, recordId, data: dataRef.current, saveId };
    
    setIsSaving(true);
    registerSave(saveId);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (pendingSaveRef.current) {
        const { collectionName: col, recordId: id, data: payload, saveId: sId } = pendingSaveRef.current;
        pendingSaveRef.current = null;
        performSave(col, id, payload, sId);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, collectionName, recordId, debounceMs, registerSave, isDirty]);

  // Flush pending save on unmount or when recordId changes
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        const { collectionName: col, recordId: id, data: payload, saveId } = pendingSaveRef.current;
        
        console.log(`[AutoSave] Flushing pending save on unmount for ${col}/${id}`);
        // Fire and forget the save to ensure data isn't lost when navigating away
        pb.collection(col).update(id, payload, { $autoCancel: false })
          .catch(err => {
            console.error(`[AutoSave] Error flushing save on unmount:`, err);
            console.error(`[AutoSave] Unmount flush validation errors:`, err.response?.data);
          })
          .finally(() => {
            unregisterSave(saveId);
          });
          
        pendingSaveRef.current = null;
      }
    };
  }, [recordId, unregisterSave]);

  return { isSaving, lastSaved, error, triggerSave };
};