import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  LogOut, 
  User, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { tierBenefits } from '@/lib/tierBenefits.js';
import { cn } from '@/lib/utils.js';

const SettingsPage = () => {
  const { currentUser, logout, subscriptionPlan, subscriptionStatus, subscriptionCurrentPeriodEnd } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [subscriptionRecord, setSubscriptionRecord] = useState(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  const [name, setName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: ''
  });

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingSub(true);
        const record = await pb.collection('subscriptions').getFirstListItem(`userId="${currentUser.id}"`, {
          $autoCancel: false
        });
        setSubscriptionRecord(record);
      } catch (error) {
        console.log('No detailed subscription record found.');
      } finally {
        setIsLoadingSub(false);
      }
    };

    fetchSubscriptionDetails();
  }, [currentUser]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsSavingName(true);
    try {
      const updatedUser = await pb.collection('users').update(currentUser.id, { name: name.trim() }, { $autoCancel: false });
      // Update the global auth store so the UI reflects the change everywhere
      pb.authStore.save(pb.authStore.token, updatedUser);
      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await pb.collection('users').update(currentUser.id, passwordData, { $autoCancel: false });
      toast.success('Password updated successfully');
      setPasswordData({ oldPassword: '', password: '', passwordConfirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.message || 'Failed to update password. Check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsManagingBilling(true);
      toast.loading('Opening billing portal...', { id: 'billing' });
      
      const response = await apiServerClient.fetch('/stripe/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open billing portal');
      }
      
      const data = await response.json();
      toast.success('Redirecting...', { id: 'billing' });
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error(error.message || 'Could not open billing portal. Please try again.', { id: 'billing' });
    } finally {
      setIsManagingBilling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const currentTierId = subscriptionPlan || 'apprentice';
  const currentTier = tierBenefits[currentTierId];
  const isPaidTier = currentTierId === 'paid' || subscriptionStatus === 'active';
  const isCanceled = subscriptionStatus === 'canceled';
  const isPastDue = subscriptionStatus === 'past_due';

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'trialing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'past_due': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'canceled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Settings - Quil Forge</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold-gradient">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account, subscription, and security.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          <nav className="flex flex-col space-y-2">
            <Button 
              variant={activeTab === 'profile' ? 'secondary' : 'ghost'} 
              className="justify-start"
              onClick={() => setActiveTab('profile')}
            >
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Button 
              variant={activeTab === 'subscription' ? 'secondary' : 'ghost'} 
              className="justify-start"
              onClick={() => setActiveTab('subscription')}
            >
              <CreditCard className="mr-2 h-4 w-4" /> Subscription
            </Button>
            <Button 
              variant={activeTab === 'security' ? 'secondary' : 'ghost'} 
              className="justify-start"
              onClick={() => setActiveTab('security')}
            >
              <Lock className="mr-2 h-4 w-4" /> Security
            </Button>
          </nav>

          <div className="space-y-8">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="flex gap-3">
                      <Input 
                        id="name"
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background text-foreground max-w-md" 
                        placeholder="Your name"
                      />
                      <Button 
                        onClick={handleUpdateName} 
                        disabled={isSavingName || name.trim() === currentUser?.name}
                      >
                        {isSavingName ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      value={currentUser?.email || ''} 
                      disabled 
                      className="bg-muted/50 text-foreground max-w-md" 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    To change your email, please contact support.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Subscription Section */}
            {activeTab === 'subscription' && (
              <Card className="border-primary/20 shadow-md overflow-hidden relative">
                {isPaidTier && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
                )}
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        {currentTier.name} Plan
                        {isPaidTier && <Sparkles className="h-5 w-5 text-primary" />}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-base">
                        {currentTier.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={cn("px-3 py-1 text-sm font-medium capitalize", getStatusColor(subscriptionStatus || 'active'))}>
                        {subscriptionStatus || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Subscription Details */}
                  {isPaidTier && (
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Period Ends</p>
                        <p className="font-medium">
                          {subscriptionCurrentPeriodEnd 
                            ? format(new Date(subscriptionCurrentPeriodEnd * 1000), 'MMMM d, yyyy')
                            : subscriptionRecord?.currentPeriodEnd 
                              ? format(new Date(subscriptionRecord.currentPeriodEnd), 'MMMM d, yyyy')
                              : 'N/A'}
                        </p>
                      </div>
                      {subscriptionRecord?.currentPeriodStart && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Started On</p>
                          <p className="font-medium">
                            {format(new Date(subscriptionRecord.currentPeriodStart), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Benefits List */}
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Your Plan Benefits</h4>
                    <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{currentTier.projects}</span>
                      </div>
                      {currentTier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-muted/20 border-t border-border/50 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    {isPaidTier 
                      ? "Manage your payment methods and billing history securely via Stripe."
                      : "Upgrade to unlock unlimited projects and advanced features."}
                  </p>
                  
                  {!isPaidTier ? (
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/pricing">
                        Upgrade Plan <Sparkles className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : isCanceled || isPastDue ? (
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/pricing">
                        Renew Subscription
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleManageSubscription} 
                      disabled={isManagingBilling}
                      variant="outline"
                      className="w-full sm:w-auto border-primary/20 hover:bg-primary/5"
                    >
                      {isManagingBilling ? 'Loading...' : 'Manage Billing'}
                      {!isManagingBilling && <ExternalLink className="ml-2 h-4 w-4" />}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}

            {/* Security Section */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handlePasswordChange}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <Input 
                          id="oldPassword" 
                          type="password" 
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          required
                          className="text-foreground bg-background max-w-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                          required
                          className="text-foreground bg-background max-w-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passwordConfirm">Confirm New Password</Label>
                        <Input 
                          id="passwordConfirm" 
                          type="password" 
                          value={passwordData.passwordConfirm}
                          onChange={(e) => setPasswordData({...passwordData, passwordConfirm: e.target.value})}
                          required
                          className="text-foreground bg-background max-w-md"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card className="border-destructive/30 shadow-sm bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Actions that affect your account access.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;