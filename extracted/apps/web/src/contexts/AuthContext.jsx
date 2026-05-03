import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionCurrentPeriodEnd, setSubscriptionCurrentPeriodEnd] = useState(null);

  const fetchSubscriptionStatus = async (userId) => {
    try {
      const response = await apiServerClient.fetch(`/stripe/subscription-status?userId=${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch subscription status');
        return;
      }
      const data = await response.json();
      setSubscriptionStatus(data.subscription_status || 'inactive');
      setSubscriptionPlan(data.subscription_plan || null);
      setSubscriptionCurrentPeriodEnd(data.subscription_current_period_end || null);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus('inactive');
      setSubscriptionPlan(null);
      setSubscriptionCurrentPeriodEnd(null);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setSubscriptionStatus(null);
    setSubscriptionPlan(null);
    setSubscriptionCurrentPeriodEnd(null);
    
    // If we are not already on the login page or home page, redirect
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      const user = pb.authStore.model;
      setCurrentUser(user);
      
      if (user) {
        if (!pb.authStore.isValid) {
          logout();
        } else {
          await fetchSubscriptionStatus(user.id);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth store changes (login/logout from other tabs, etc.)
    const unsubscribe = pb.authStore.onChange(async (token, model) => {
      setCurrentUser(model);
      if (model) {
        await fetchSubscriptionStatus(model.id);
      } else {
        setSubscriptionStatus(null);
        setSubscriptionPlan(null);
        setSubscriptionCurrentPeriodEnd(null);
      }
    });

    // Global fetch interceptor for 401 errors to handle token expiration
    // Note: 403 Forbidden errors are intentionally excluded here so they can bubble up
    // to the component level for specific permission-denied UI handling.
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 401) {
          // Check if it's an API call that requires auth
          const url = typeof args[0] === 'string' ? args[0] : args[0].url;
          if (url.includes('/api/') || url.includes('/hcgi/api')) {
            logout();
          }
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      unsubscribe();
      window.fetch = originalFetch;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, {
        $autoCancel: false,
      });
      setCurrentUser(authData.record);
      
      // Fetch subscription status after successful login
      await fetchSubscriptionStatus(authData.record.id);
      
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, name, tier = 'paid') => {
    try {
      // Create the user with the updated schema fields
      const record = await pb.collection('users').create(
        {
          email,
          password,
          passwordConfirm: password,
          name,
          subscription_plan: tier,
          subscription_status: 'trialing'
        },
        { $autoCancel: false }
      );

      // Automatically log them in after successful signup
      const authData = await login(email, password);
      
      // Fetch subscription status for new user
      await fetchSubscriptionStatus(record.id);
      
      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await pb.collection('users').requestPasswordReset(email, {
        $autoCancel: false,
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const refreshSubscriptionStatus = async () => {
    if (currentUser) {
      await fetchSubscriptionStatus(currentUser.id);
    }
  };

  const value = {
    currentUser,
    isLoading,
    subscriptionStatus,
    subscriptionPlan,
    subscriptionCurrentPeriodEnd,
    login,
    logout,
    resetPassword,
    refreshSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};