import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

const UpgradeButton = ({ tier = 'paid', variant = 'default', size = 'default', className = '' }) => {
  const { currentUser, subscriptionStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Only show button if user is not on an active subscription
  if (subscriptionStatus === 'active') {
    return null;
  }

  const handleUpgrade = async () => {
    if (!currentUser) {
      toast.error('Please log in to upgrade your subscription');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          tier: tier,
          successUrl: `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Could not start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade
        </>
      )}
    </Button>
  );
};

export default UpgradeButton;