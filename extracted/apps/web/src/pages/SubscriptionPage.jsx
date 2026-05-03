import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Check, X, AlertTriangle, CreditCard, Calendar, Zap } from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useSubscription } from '@/contexts/SubscriptionContext.jsx';
import apiServerClient from '@/lib/apiServerClient';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SubscriptionPage = () => {
  const { subscription, currentTier, subscriptionStatus, renewalDate, isLoading, updateSubscriptionTier } = useSubscription();
  const [isManaging, setIsManaging] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsManaging(true);
      const response = await apiServerClient.fetch('/stripe/manage-subscription', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }
      
      const data = await response.json();
      window.open(data.portalUrl, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Could not open billing portal. Please try again later.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      const response = await apiServerClient.fetch('/stripe/cancel-subscription', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      toast.success('Subscription canceled successfully. You will have access until the end of your billing period.');
      await updateSubscriptionTier();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Could not cancel subscription. Please contact support.');
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Trialing</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Free Tier</Badge>;
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'archmage': return 'Archmage';
      case 'scribe': return 'Scribe';
      default: return 'Apprentice';
    }
  };

  const features = [
    { name: 'Projects', apprentice: '1 Project', scribe: 'Unlimited', archmage: 'Unlimited' },
    { name: 'AI Credits', apprentice: '10 Lifetime', scribe: '25 / Month', archmage: 'Unlimited' },
    { name: 'World Grimoire', apprentice: 'Basic', scribe: 'Full Access', archmage: 'Full Access' },
    { name: 'Beat Sheets', apprentice: '3-Act Only', scribe: 'All 6 Structures', archmage: 'All 6 Structures' },
    { name: 'Timeline Creator', apprentice: false, scribe: true, archmage: true },
    { name: 'Export Options', apprentice: 'Plain Text', scribe: 'Word/PDF/ePub', archmage: 'Word/PDF/ePub' },
    { name: 'Beta Guild', apprentice: false, scribe: '5 Readers', archmage: 'Unlimited' },
    { name: 'Co-authoring', apprentice: false, scribe: false, archmage: true },
    { name: 'Series Management', apprentice: false, scribe: false, archmage: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Subscription - Quil Forge</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-4">Your Grimoire</h1>
            <p className="text-muted-foreground text-lg">Manage your subscription, billing, and access level.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="md:col-span-2">
                <CardHeader>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="md:col-span-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        Current Tier: <span className="text-primary">{getTierName(currentTier)}</span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {currentTier === 'apprentice' 
                          ? "You are currently on the free Apprentice tier." 
                          : "Thank you for supporting Quil Forge."}
                      </CardDescription>
                    </div>
                    {getStatusBadge(subscriptionStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-1">Status</h4>
                        <p className="font-medium">
                          {subscriptionStatus === 'active' ? 'Active Subscription' : 
                           subscriptionStatus === 'canceled' ? 'Cancels at end of period' : 
                           'Free Account'}
                        </p>
                      </div>
                    </div>
                    
                    {renewalDate && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-1">
                            {subscriptionStatus === 'canceled' ? 'Access Ends' : 'Next Billing Date'}
                          </h4>
                          <p className="font-medium">
                            {format(new Date(renewalDate), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-4">
                  {currentTier !== 'apprentice' ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleManageSubscription}
                        disabled={isManaging}
                      >
                        {isManaging ? 'Loading...' : 'Manage Payment Method'}
                      </Button>
                      
                      {subscriptionStatus === 'active' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel your subscription at the end of your current billing period. You will lose access to premium features on {renewalDate ? format(new Date(renewalDate), 'MMMM d, yyyy') : 'the renewal date'}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleCancelSubscription}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">Upgrade to unlock premium features and unlimited AI credits.</p>
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to="/pricing">View Offerings</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Feature Comparison</h2>
              {currentTier !== 'archmage' && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/pricing">Upgrade Tier</Link>
                </Button>
              )}
            </div>
            
            <div className="rounded-xl border border-border overflow-hidden bg-card/30 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[300px]">Feature</TableHead>
                    <TableHead className={`text-center ${currentTier === 'apprentice' ? 'text-primary font-bold' : ''}`}>
                      Apprentice
                      {currentTier === 'apprentice' && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Current</span>}
                    </TableHead>
                    <TableHead className={`text-center ${currentTier === 'scribe' ? 'text-primary font-bold' : ''}`}>
                      Scribe
                      {currentTier === 'scribe' && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Current</span>}
                    </TableHead>
                    <TableHead className={`text-center ${currentTier === 'archmage' ? 'text-primary font-bold' : ''}`}>
                      Archmage
                      {currentTier === 'archmage' && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Current</span>}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {typeof feature.apprentice === 'boolean' ? (
                          feature.apprentice ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />
                        ) : (
                          feature.apprentice
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.scribe === 'boolean' ? (
                          feature.scribe ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />
                        ) : (
                          feature.scribe
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.archmage === 'boolean' ? (
                          feature.archmage ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />
                        ) : (
                          feature.archmage
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscriptionPage;