import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const { currentUser, signup } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  const isFormValid = email.length > 0 && passwordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setError('');
    setIsLoading(true);

    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.email?.code === 'validation_not_unique') {
        setError('This spirit is already known to us. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to consecrate your account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Begin Your Journey | The Power of Three</title>
      </Helmet>
      
      <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/30 selection:text-primary">
        <div className="max-w-md w-full py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
              Begin Your Journey
            </h1>
            <p className="text-lg font-serif-body text-foreground/80 italic">
              Bind your name to the book and call forth your circle.
            </p>
          </div>

          <div className="bg-card border border-secondary p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(107,74,125,0.15)] relative">
            
            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-primary"></div>
            <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-primary"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-primary"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-primary"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-destructive font-serif-display italic text-center">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-serif-display text-lg text-primary tracking-wide" htmlFor="email">
                  Your Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary h-12 font-serif-body"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-serif-display text-lg text-primary tracking-wide" htmlFor="password">
                  The Secret Word
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary h-12 font-serif-body"
                  required
                />
                {password.length > 0 && (
                  <p className={`text-sm font-serif-display italic ${passwordValid ? 'text-green-500' : 'text-primary'}`}>
                    {passwordValid ? 'Strong enough to bind.' : 'Must be at least 8 characters long.'}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block font-serif-display text-lg text-primary tracking-wide" htmlFor="confirmPassword">
                  Repeat the Word
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary h-12 font-serif-body"
                  required
                />
                {confirmPassword.length > 0 && (
                  <p className={`text-sm font-serif-display italic ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}>
                    {passwordsMatch ? 'The resonance is pure.' : 'The words do not match.'}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-14 mt-6 bg-primary text-primary-foreground font-display text-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,86,0.2)] hover:shadow-[0_0_20px_rgba(212,175,86,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Binding...' : 'Create Account'}
              </Button>
              
              <div className="text-center pt-4 border-t border-secondary/30 mt-6">
                <p className="font-serif-body text-foreground/70">
                  Already bound?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 hover:underline font-serif-display italic text-lg transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}