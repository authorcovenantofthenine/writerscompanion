import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';
import UpgradeButton from '@/components/UpgradeButton.jsx';

const PremiumFeatureGate = ({ 
  feature,
  children, 
  fallback,
  featureName = 'Premium Feature', 
  featureDescription = 'This feature requires an active subscription.',
  forceLock = false 
}) => {
  const { canAccess, isLoading } = useFeatureAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAccess = feature ? canAccess(feature) : true;

  if (hasAccess && !forceLock) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6 w-full">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Lock className="w-32 h-32" />
        </div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Premium Feature
            </span>
          </div>
          <CardTitle className="text-2xl">{featureName}</CardTitle>
          <CardDescription className="text-base mt-2 text-foreground/80">
            {featureDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-muted-foreground">
            Upgrade to unlock this feature and gain access to powerful tools that will enhance your writing journey.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 relative z-10">
          <UpgradeButton tier="paid" variant="default" size="lg" className="w-full shadow-lg shadow-primary/20" />
          <p className="text-xs text-center text-muted-foreground">
            Get access for $27/month.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PremiumFeatureGate;