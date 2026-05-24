import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('The shadows obscure your path. Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Enter the Circle | The Power of Three</title>
      </Helmet>
      
      <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/30 selection:text-primary">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
              Enter the Circle
            </h1>
            <p className="text-lg font-serif-body text-foreground/80 italic">
              Speak your true name and step into the light.
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
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-6 bg-primary text-primary-foreground font-display text-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,86,0.2)] hover:shadow-[0_0_20px_rgba(212,175,86,0.4)] disabled:opacity-50"
              >
                {isLoading ? 'Invoking...' : 'Sign In'}
              </Button>
              
              <div className="text-center pt-4 border-t border-secondary/30 mt-6">
                <p className="font-serif-body text-foreground/70">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:text-primary/80 hover:underline font-serif-display italic text-lg transition-colors">
                    Sign up
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