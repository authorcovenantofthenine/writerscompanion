import { useAuth } from '@/contexts/AuthContext.jsx';

export const useSubscriptionAccess = () => {
  const { subscriptionStatus, currentUser, isLoading } = useAuth();

  // Single source of truth for access
  const hasAccess = subscriptionStatus === 'active' || currentUser?.community_unlock === true;

  return {
    hasAccess,
    isPremium: hasAccess, // Kept for backwards compatibility with existing components
    isArchmage: hasAccess, // Kept for backwards compatibility with existing components
    isLoading,
    
    // Feature access helpers
    canAccessTimeline: () => hasAccess,
    canAccessRelationships: () => hasAccess,
    canAccessBetaGuild: () => hasAccess,
    canAccessBetaFeatures: () => hasAccess,
    canAccessWordPdfExport: () => hasAccess,
    canAccessAllBeatSheets: () => hasAccess,
    canAccessAdvancedFeatures: () => hasAccess,
    canAccessWorldBuilder: () => hasAccess,
    canAccessCollaboration: () => hasAccess,
    canAccessExport: () => hasAccess,
    canCreateMultipleProjects: () => hasAccess,
    
    // Project limits
    getProjectLimit: () => (hasAccess ? Infinity : 0),
    canCreateProject: () => hasAccess
  };
};