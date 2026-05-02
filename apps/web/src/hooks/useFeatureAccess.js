import { useAuth } from '@/contexts/AuthContext.jsx';

const TIER_LEVELS = {
  locked: 0,
  paid: 1
};

// In the new binary system, all premium features require level 1 (paid)
const FEATURE_REQUIREMENTS = {
  projects_multiple: 1,
  beat_sheets: 1,
  timeline: 1,
  relationships: 1,
  beta_guild: 1,
  export_formats: 1,
  author_dashboard: 1,
  analytics: 1,
  series_management: 1,
  co_author: 1,
  unlimited_ai: 1,
  advanced_continuity: 1,
  plot_hole_radar: 1,
  emotional_beat_analyzer: 1,
  write_in_voice: 1
};

export const useFeatureAccess = () => {
  const { currentUser, isLoading } = useAuth();

  // Determine access based on subscription or community unlock flag
  const status = currentUser?.subscription_status || 'inactive';
  const hasCommunityUnlock = currentUser?.community_unlock === true;
  const isActiveSubscription = status === 'active' || status === 'trialing';

  // Level 1 = Paid/Unlocked, Level 0 = Locked
  const currentLevel = (isActiveSubscription || hasCommunityUnlock) ? TIER_LEVELS.paid : TIER_LEVELS.locked;
  const tier = currentLevel === 1 ? 'paid' : 'locked';

  const canAccess = (feature) => {
    const requiredLevel = FEATURE_REQUIREMENTS[feature];
    // If a feature is mapped, check level. If not, default to requiring paid access (level 1) just to be safe.
    if (requiredLevel === undefined) return currentLevel >= 1; 
    return currentLevel >= requiredLevel;
  };

  return { 
    canAccess, 
    tier, 
    // Return a virtual status if unlocked via community so UI doesn't incorrectly prompt to subscribe
    status: hasCommunityUnlock ? 'community_unlocked' : status, 
    isLoading, 
    currentLevel 
  };
};