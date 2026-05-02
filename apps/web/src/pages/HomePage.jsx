
import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Feather, 
  Sparkles, 
  BookOpen, 
  Globe, 
  CheckCircle, 
  GitCompare, 
  Network, 
  Download, 
  Star,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const InkBleedText = ({ text, className }) => {
  return (
    <span className={`inline-block ink-bleed-text ${className}`}>
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          style={{ animationDelay: `${i * 0.03}s` }}
          className={char === ' ' ? 'mr-1.5' : 'inline-block animate-[ink-bleed_2s_ease-out_forwards] opacity-0 blur-sm'}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loadingSection, setLoadingSection] = useState(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityBg = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const handleCheckout = async (section) => {
    if (!currentUser) {
      toast.info('Please sign in to subscribe.');
      navigate('/login');
      return;
    }

    try {
      setLoadingSection(section);
      
      const response = await apiServerClient.fetch('/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 2700,
          productName: 'Quil Forge Writer',
          successUrl: window.location.origin + '/success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/cancel'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize checkout');
      }

      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process. Please try again.');
    } finally {
      setLoadingSection(null);
    }
  };

  const features = [
    { 
      icon: BookOpen, 
      title: 'Manuscript Editor', 
      desc: 'Project → Book → Chapter → Scene. Scene-based structure that handles long manuscripts without slowing down.' 
    },
    { 
      icon: Globe, 
      title: 'Codex', 
      desc: 'Characters, locations, lore, factions, and magic rules in one organized hub. No more Notion tabs.' 
    },
    { 
      icon: CheckCircle, 
      title: 'Writing Goals', 
      desc: 'Daily word count targets, streak tracking, and a session heatmap. See your progress at a glance.' 
    },
    { 
      icon: GitCompare, 
      title: 'Draft Comparison', 
      desc: 'Side-by-side version history with word-level diff. Restore any previous version in one click.' 
    },
    { 
      icon: Network, 
      title: 'Character Map', 
      desc: "A visual graph of every relationship in your cast. See connections that prose can't show." 
    },
    { 
      icon: Download, 
      title: 'Export', 
      desc: "PDF, Word, and ePub when you're ready to send your manuscript somewhere." 
    },
  ];

  const pricingFeatures = [
    "Unlimited projects",
    "Manuscript editor",
    "Full Codex (all types)",
    "Writing goals + streak tracking",
    "Draft comparison",
    "Character relationship map",
    "Export to PDF, Word, and ePub"
  ];

  return (
    <div className="bg-background min-h-screen selection:bg-primary/30 selection:text-primary-foreground">
      <Helmet>
        <title>Quil Forge — The Writing Platform Built for Novelists</title>
        <meta name="description" content="Quil Forge is an all-in-one writing workspace for fiction writers. Manage manuscripts, characters, world-building, and timelines — all in one focused, beautiful app." />
        <meta name="keywords" content="fiction writing software, novel writing app, manuscript organizer, writing platform for novelists" />
        <meta property="og:title" content="Quil Forge | Everything in one focused workspace" />
        <meta property="og:description" content="Your novel doesn't need five apps. Write, organize, and track progress in a single enchanted grimoire." />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90svh] flex items-center justify-center overflow-hidden pt-24 pb-12">
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: yBg, opacity: opacityBg }}
        >
          <div className="absolute inset-0 bg-[url('/images/library-background.png')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </motion.div>

        {/* Animated Candle Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/15 blur-[120px] rounded-full animate-pulse-glow pointer-events-none z-0" />
        
        {/* Gold Mist */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-primary/5 to-transparent opacity-50 pointer-events-none z-0" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full animate-particle-drift"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100 + 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 15}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative inline-block mb-4 max-w-4xl">
              <Feather className="absolute -top-8 -right-8 md:-right-12 w-10 h-10 text-primary/60 animate-float hidden sm:block" />
              <h1 className="text-5xl md:text-6xl lg:text-7xl mb-3 text-gold-gradient drop-shadow-[0_0_30px_rgba(201,168,76,0.3)] leading-[1.05] tracking-tight">
                <InkBleedText text="Your novel doesn't need five apps." />
              </h1>
              <h2 className="text-gold-gradient text-xl md:text-2xl lg:text-3xl mt-2 mb-4 block font-cormorant italic font-normal tracking-wide">
                Everything in one focused workspace.
              </h2>
            </div>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 font-eb-garamond max-w-3xl mx-auto leading-snug text-balance">
              You're writing in Google Docs, tracking characters in Notion, managing lore in a spreadsheet, and timing sessions with a separate app. Quil Forge replaces all of it — manuscript editor, character codex, world-building, writing goals, draft comparison, and more.
            </p>

            <div className="relative flex flex-col items-center justify-center gap-3 mt-6 max-w-md mx-auto">
              <Sparkles className="absolute -top-6 -left-4 w-5 h-5 text-primary/70 animate-pulse hidden sm:block" />
              <Star className="absolute -bottom-4 -right-4 w-4 h-4 text-primary/50 animate-pulse hidden sm:block" style={{ animationDelay: '1s' }} />

              <button 
                onClick={() => handleCheckout('hero')}
                disabled={loadingSection === 'hero'}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:brightness-110 disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer disabled:cursor-wait"
              >
                {loadingSection === 'hero' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Get Access — $27/month'
                )}
              </button>
              
              <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide">
                Already a member?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-break" />

      {/* Features Section */}
      <section className="py-12 relative bg-section-bg overflow-hidden">
        <svg className="absolute rune-watermark w-[600px] h-[600px] -left-48 top-10 opacity-[0.02]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.2"/>
        </svg>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl text-gold-gradient mb-3 font-bold tracking-tight">What's inside</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-5 rounded-xl group hover:border-primary/50 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.1)] transition-all duration-300 relative overflow-hidden bg-background/40 backdrop-blur-sm border border-primary/10 flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 transform origin-top-right pointer-events-none">
                  <feature.icon className="w-24 h-24 text-primary" />
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 relative z-10 group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                
                <h4 className="text-lg text-foreground mb-2 font-cinzel font-bold tracking-wide relative z-10">{feature.title}</h4>
                <p className="text-muted-foreground text-sm relative z-10 leading-snug">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-break" />

      {/* Pricing Section */}
      <section className="py-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl text-gold-gradient mb-2 font-bold tracking-tight">One plan. Full access.</h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-eb-garamond italic">Everything you need to write and finish your story.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl border-2 border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.1)] relative overflow-hidden flex flex-col gold-glow">
              {/* Decorative Header Banner */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              
              <div className="p-6 sm:p-8 text-center border-b border-border/50 bg-background/50">
                <h3 className="text-lg font-cinzel font-bold text-primary uppercase tracking-widest mb-2">Writer</h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">$27</span>
                  <span className="text-muted-foreground text-base font-medium">/ month</span>
                </div>
                <p className="text-muted-foreground text-xs font-medium">Cancel anytime.</p>
              </div>
              
              <div className="p-6 sm:p-8 flex-grow bg-card/50">
                <ul className="space-y-3 text-left mb-6">
                  {pricingFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-foreground/90 text-sm font-medium leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleCheckout('pricing')}
                  disabled={loadingSection === 'pricing'}
                  className="w-full group relative flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:brightness-110 active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-wait"
                >
                  {loadingSection === 'pricing' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    'Get Access'
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                In our Skool community?{' '}
                <a href="#" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                  Reach Level 3 for free access.
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-break" />

      {/* Final CTA Section */}
      <section className="py-16 relative overflow-hidden border-t border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto flex flex-col items-center"
          >
            <Feather className="w-8 h-8 text-primary/40 mb-4" />
            <h2 className="text-4xl md:text-5xl mb-3 text-gold-gradient font-bold tracking-tight">Your story is already in your head.</h2>
            <h3 className="text-xl text-muted-foreground mb-8 font-cormorant italic">
              Give it a place to live.
            </h3>
            
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <button 
                onClick={() => handleCheckout('cta')}
                disabled={loadingSection === 'cta'}
                className="w-full group relative inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:brightness-110 disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer disabled:cursor-wait"
              >
                {loadingSection === 'cta' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Get Access — $27/month'
                )}
              </button>
              <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
