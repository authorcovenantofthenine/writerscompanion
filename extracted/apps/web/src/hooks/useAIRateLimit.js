
import { useState, useCallback } from 'react';

export default function useAIRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkError = useCallback((error) => {
    const status = error?.status || error?.response?.status;
    const message = typeof error === 'string' ? error : error?.message || error?.response?.data?.message || '';
    
    const isLimited = status === 429 || message.toLowerCase().includes('rate limit');
    
    if (isLimited) {
      setIsRateLimited(true);
    }
    
    return isLimited;
  }, []);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
  }, []);

  return { isRateLimited, checkError, clearRateLimit };
}
