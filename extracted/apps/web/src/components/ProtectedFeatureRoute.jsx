import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import { toast } from 'sonner';

const ProtectedFeatureRoute = ({ feature, children, featureName }) => {
  const { canAccess, isLoading } = useFeatureAccess();

  useEffect(() => {
    if (!isLoading && !canAccess(feature)) {
      toast.error(`${featureName || 'This feature'} requires a premium subscription. Upgrade to unlock.`);
    }
  }, [isLoading, canAccess, feature, featureName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canAccess(feature)) {
    return <Navigate to="/pricing" replace />;
  }

  return children;
};

export default ProtectedFeatureRoute;