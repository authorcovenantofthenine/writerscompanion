import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCircleMembers } from '@/hooks/useCircleMembers.js';
import pb from '@/lib/pocketbaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FullCircleError from '@/components/FullCircleError.jsx';

export default function JoinPage() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { currentUser, login, signup, initialLoading } = useAuth();
  
  // Hook called at the top level, complying with Rules of Hooks
  const { isUserMember, addMemberToCircle } = useCircleMembers();

  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullCircle, setIsFullCircle] = useState(false);
  
  // Form State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initJoinFlow = async () => {
      if (initialLoading) return;
      
      if (!circleId) {
        setError("Invalid summons. No circle identifier provided.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const circleRecord = await pb.collection('circles').getOne(circleId, { 
          expand: 'member_1_id,member_2_id,member_3_id',
          $autoCancel: false 
        });
        
        setCircle(circleRecord);

        // Count members by checking if member fields exist
        const memberCount = [
          circleRecord.member_1_id, 
          circleRecord.member_2_id, 
          circleRecord.member_3_id
        ].filter(Boolean).length;

        if (memberCount === 3) {
          setIsFullCircle(true);
          setLoading(false);
          return;
        }

        if (currentUser) {
          const alreadyMember = await isUserMember(circleId, currentUser.id);
          if (alreadyMember) {
            navigate('/dashboard');
            return;
          } else {
            // Auto join since they are logged in
            setIsSubmitting(true);
            await addMemberToCircle(circleId, currentUser.id, currentUser.name || currentUser.email.split('@')[0]);
            navigate('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error("Circle fetch error:", err);
        setError("The summons is invalid or the circle does not exist.");
      } finally {
        setLoading(false);
      }
    };

    initJoinFlow();
  }, [circleId, currentUser, initialLoading, navigate, isUserMember, addMemberToCircle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password, circleId);
      } else {
        await signup(email, password, name, circleId);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. The spirits resist your entry.');
      setIsSubmitting(false);
    }
  };

  if (initialLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center justify-center p-6 space-y-6 text-primary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif-display text-xl animate-pulse">Reading the summons...</p>
      </div>
    );
  }

  if (isFullCircle) {
    return (
      <>
        <Helmet>
          <title>Circle Complete | The Power of Three</title>
        </Helmet>
        <FullCircleError circleName={circle?.circleName} />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="parchment-scroll max-w-lg w-full flex flex-col items-center">
          <h2 className="text-3xl font-display text-destructive mb-4">Summons Failed</h2>
          <p className="font-serif-body text-foreground/80 mb-8">{error}</p>
          <Link to="/" className="copy-button text-sm px-6 py-2">
            Return to the World
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = [circle?.member_1_id, circle?.member_2_id, circle?.member_3_id].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Answer the Summons | The Power of Three</title>
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex flex-col items-center justify-center py-16 px-6 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="parchment-scroll max-w-md w-full z-10 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif-display text-primary mb-2 leading-tight">
              You are summoned to <br/> <span className="font-display italic text-foreground">{circle?.circleName}</span>
            </h1>
            <p className="font-serif-display italic text-foreground/70 mb-4">
              Complete your account to join the circle.
            </p>
            <div className="inline-block bg-background/50 border border-secondary/50 px-4 py-1.5 rounded-full text-xs font-serif-display tracking-widest text-primary uppercase">
              {memberCount} of 3 members have joined
            </div>
          </div>

          {error && (
            <div className="mb-6 text-destructive text-sm font-serif-body text-center bg-destructive/10 p-3 rounded border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-sm font-serif-display text-foreground/80">Your Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/80 border-secondary focus:border-primary text-foreground font-serif-body"
                  placeholder="How shall you be known?"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-serif-display text-foreground/80">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/80 border-secondary focus:border-primary text-foreground font-serif-body"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-serif-display text-foreground/80">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/80 border-secondary focus:border-primary text-foreground font-serif-body"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-primary text-primary-foreground font-display font-bold text-lg h-12 hover:bg-primary/90 hover:scale-[1.02] transition-all"
            >
              {isSubmitting ? 'Entering...' : (isLoginMode ? 'Enter the Circle' : 'Join the Guild')}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-secondary/30 pt-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
              className="text-primary hover:text-primary/80 font-serif-display italic text-lg transition-colors underline decoration-primary/30 underline-offset-4"
            >
              {isLoginMode ? "Need an account? Sign up" : "Already bound? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}