import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess.js';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const ProtectedFeature = ({ requiredTier, children, fallback, featureName, featureDescription }) => {
  const { hasAccess, isLoading } = useSubscriptionAccess(requiredTier);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-1/3 mt-4" />
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Lock className="w-24 h-24" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Writer Plan Feature
          </span>
        </div>
        <CardTitle className="text-2xl">{featureName || 'Premium Feature'}</CardTitle>
        <CardDescription className="text-base mt-2">
          {featureDescription || 'This feature requires an active Writer Plan subscription.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Get full access to every feature in Quil Forge for $27/month.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/pricing">View Offerings</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProtectedFeature;