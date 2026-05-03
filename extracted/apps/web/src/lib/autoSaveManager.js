import pb from '@/lib/pocketbaseClient.js';

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const hasChanged = (obj1, obj2) => {
  if (obj1 === obj2) return false;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return true;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return true;
  
  for (let key of keys1) {
    if (key === 'updated' || key === 'created' || key === 'lastEdited') continue; // Ignore timestamps
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (hasChanged(obj1[key], obj2[key])) return true;
    } else if (obj1[key] !== obj2[key]) {
      return true;
    }
  }
  return false;
};

export const detectConflict = async (collectionName, recordId, currentUpdated) => {
  try {
    const record = await pb.collection(collectionName).getOne(recordId, { $autoCancel: false });
    return record.updated !== currentUpdated;
  } catch (error) {
    console.error(`Conflict detection failed for ${collectionName} (${recordId}):`, error);
    return false;
  }
};

export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      console.error(`[AutoSave] Attempt ${retries} failed:`, error);
      console.error(`[AutoSave] Response status:`, error.status);
      console.error(`[AutoSave] Validation/Response data:`, error.response?.data || error.response);

      // Status 400 = Validation Error, 403 = Forbidden, 404 = Not Found
      if (retries >= maxRetries || error.status === 400 || error.status === 403 || error.status === 404) {
        throw error; // Don't retry client/validation errors or if max retries reached
      }
      
      const delay = baseDelay * Math.pow(2, retries - 1);
      console.log(`[AutoSave] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const queueSave = (queue, saveData) => {
  const existingIndex = queue.findIndex(
    item => item.collectionName === saveData.collectionName && item.recordId === saveData.recordId
  );
  
  if (existingIndex >= 0) {
    const newQueue = [...queue];
    newQueue[existingIndex] = { 
      ...newQueue[existingIndex], 
      data: { ...newQueue[existingIndex].data, ...saveData.data } 
    };
    return newQueue;
  }
  
  return [...queue, saveData];
};

export const syncQueue = async (queue, onProgress, onError) => {
  const failedItems = [];
  
  for (const item of queue) {
    try {
      await retryWithBackoff(() => 
        pb.collection(item.collectionName).update(item.recordId, item.data, { $autoCancel: false })
      );
      if (onProgress) onProgress(item);
    } catch (error) {
      console.error(`Failed to sync queued item ${item.recordId}:`, error);
      failedItems.push(item);
      if (onError) onError(error, item);
    }
  }
  
  return failedItems;
};