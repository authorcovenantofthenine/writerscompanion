import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, Mail, CreditCard, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found in the URL.');
      setLoading(false);
      return;
    }

    const processPayment = async () => {
      try {
        // Step 1: Verify session with Stripe via our backend
        const response = await apiServerClient.fetch(`/stripe/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to verify payment session.');
        }
        const data = await response.json();
        setSessionData(data);

        // Step 2: Store subscription in PocketBase if user is authenticated and payment is paid
        if (currentUser && data.status === 'paid') {
          // Check if subscription record for this session already exists to prevent duplicates
          const existingRecords = await pb.collection('subscriptions').getList(1, 1, {
            filter: `stripeSubscriptionId = "${data.id}"`,
            $autoCancel: false
          });

          if (existingRecords.totalItems === 0) {
            const now = new Date();
            const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            await pb.collection('subscriptions').create({
              userId: currentUser.id,
              stripeCustomerId: data.customerId || '',
              stripeSubscriptionId: data.id,
              tier: 'paid',
              status: 'active',
              currentPeriodStart: now.toISOString(),
              currentPeriodEnd: nextMonth.toISOString()
            }, { $autoCancel: false });
          }
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setError('We encountered an issue confirming your payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [sessionId, currentUser]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Payment Successful - Quil Forge</title>
      </Helmet>

      <Header />

      <main className="flex-grow flex items-center justify-center p-4 pt-32 pb-24 relative">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg relative z-10"
        >
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
            {loading ? (
              <CardContent className="flex flex-col items-center justify-center py-20 space-y-5">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse text-lg">Verifying your grimoire update...</p>
              </CardContent>
            ) : error ? (
              <>
                <CardHeader className="text-center pb-2 pt-10">
                  <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🤔</span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">Verification Issue</CardTitle>
                  <CardDescription className="text-base mt-2 max-w-sm mx-auto">{error}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center pt-6 pb-10">
                  <Button onClick={() => navigate('/pricing')} variant="outline" size="lg">
                    Return to Pricing
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <div className="h-2 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                <CardHeader className="text-center pb-2 pt-10">
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground mb-2">Payment Successful!</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Your account has been fully unlocked. Welcome to Quil Forge Writer.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-6">
                  <div className="bg-background rounded-xl p-6 border border-border/50 space-y-5 shadow-inner">
                    <div className="flex justify-between items-center pb-4 border-b border-border/40">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Amount Paid</span>
                      </div>
                      <span className="font-semibold text-lg text-foreground">
                        ${((sessionData?.amountTotal || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-border/40">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>Customer Email</span>
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {sessionData?.customerEmail || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                        {sessionData?.status === 'paid' ? 'Active' : sessionData?.status || 'Complete'}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-4 pb-10 px-8">
                  {currentUser ? (
                    <Button 
                      className="w-full h-14 text-base font-bold tracking-wide group bg-primary hover:bg-primary/90 text-primary-foreground hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20" 
                      onClick={() => navigate('/app/dashboard')}
                    >
                      Enter the Forge
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <div className="space-y-4 w-full">
                      <p className="text-sm text-center text-muted-foreground">
                        Please sign in to link this subscription to your account.
                      </p>
                      <Button 
                        className="w-full h-14 text-base font-bold tracking-wide group bg-primary hover:bg-primary/90 text-primary-foreground hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20" 
                        onClick={() => navigate('/login')}
                      >
                        Sign In to Continue
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;