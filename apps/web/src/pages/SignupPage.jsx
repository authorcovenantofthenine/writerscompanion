import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import MagicalBackground from '@/components/MagicalBackground.jsx';

const SignupPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://www.skool.com/quilauthorsguild';
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <Helmet>
        <title>Join the Guild - Quil Forge</title>
        <meta name="description" content="Join the Quil Forge Authors Guild on Skool." />
      </Helmet>

      <MagicalBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 text-center bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 premium-shadow glow-effect"
      >
        <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gold-gradient">Join the Authors Guild</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Registration is now handled exclusively through our Skool community.
        </p>
        
        <p className="text-sm text-muted-foreground mb-6">
          Redirecting you automatically...
        </p>
        
        <a 
          href="https://www.skool.com/quilauthorsguild"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:brightness-110 transition-all"
        >
          Click here if not redirected <ExternalLink className="ml-2 w-4 h-4" />
        </a>
      </motion.div>
    </div>
  );
};

export default SignupPage;