import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const { currentUser, refreshSubscriptionStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await apiServerClient.fetch(`/stripe/session/${sessionId}`);
        if (!res.ok) {
          throw new Error('Failed to verify session');
        }
        
        const data = await res.json();

        if (data.status === 'paid' || data.status === 'complete') {
          if (currentUser) {
            // Update user status in PocketBase
            await pb.collection('users').update(currentUser.id, {
              subscription_status: 'active'
            }, { $autoCancel: false });
            
            // Refresh local auth context
            await refreshSubscriptionStatus();
          }
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, currentUser, refreshSubscriptionStatus]);

  return (
    <AppLayout>
      <Helmet>
        <title>Subscription Status - Quil Forge</title>
      </Helmet>

      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-xl relative overflow-hidden">
          {status === 'loading' && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <CardTitle className="text-2xl">Verifying Enchantment...</CardTitle>
                <CardDescription>Please wait while we confirm your subscription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
                <Skeleton className="h-4 w-4/6 mx-auto" />
              </CardContent>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-32 h-32" />
              </div>
              <CardHeader className="text-center pb-2 relative z-10">
                <div className="mx-auto w-16 h-16 mb-4 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <CardTitle className="text-2xl text-glow">Welcome to the Guild!</CardTitle>
                <CardDescription className="text-base mt-2">
                  Your subscription has been successfully activated.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <p className="text-muted-foreground">
                  Your grimoire is now fully unlocked. You have access to all the premium features of your selected tier.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center relative z-10 pt-4">
                <Button size="lg" className="w-full group" onClick={() => navigate('/app/dashboard')}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </>
          )}

          {status === 'error' && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Verification Failed</CardTitle>
                <CardDescription className="text-base mt-2">
                  We couldn't verify your subscription payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  If you completed the payment, please contact support or check your dashboard in a few minutes as the webhook might still be processing.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-4">
                <Button size="lg" className="w-full" onClick={() => navigate('/app/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/pricing">Return to Pricing</Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default SubscriptionSuccess;