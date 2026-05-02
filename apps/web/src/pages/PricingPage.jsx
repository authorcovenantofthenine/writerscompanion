
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, PenTool, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { tierBenefits } from '@/lib/tierBenefits.js';

const PricingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!currentUser) {
      toast.info('Please sign in to subscribe.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
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
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Helmet>
        <title>Quil Forge Pricing — Plans for Every Writer</title>
        <meta name="description" content="Simple, transparent pricing for fiction writers. Start free and upgrade when you're ready for advanced tools like collaboration, analytics, and the Beta Guild." />
      </Helmet>

      <Header />

      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 relative z-10 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-gold-gradient mb-6 text-balance text-4xl md:text-5xl font-bold">
              Unlock Your Creative Universe.
            </h1>
            <p className="text-xl text-muted-foreground text-balance">
              One simple plan. Everything you need to write, organize, and finish your manuscript.
            </p>
          </motion.div>
        </section>

        {/* Pricing Card */}
        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-lg mx-auto relative z-10"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
              <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg shadow-primary/30 border border-primary-foreground/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Full Access
              </div>
            </div>
            
            <Card className="flex flex-col border-primary bg-section-bg gold-glow shadow-2xl shadow-primary/10 relative overflow-hidden">
              <CardHeader className="pb-8 pt-10 text-center border-b border-border/50">
                <div className="flex items-center justify-center gap-2 mb-4 text-primary">
                  <PenTool className="w-6 h-6" />
                  <span className="font-semibold tracking-wider uppercase text-sm">Writer Plan</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <CardTitle className="text-5xl font-bold">$27</CardTitle>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-sm font-medium text-primary italic mb-4">
                  For the author who shows up. Every day.
                </p>
                <CardDescription className="text-base leading-relaxed text-foreground/80 max-w-sm mx-auto">
                  {tierBenefits.paid.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-8 pb-8 px-8 sm:px-10">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-6 text-center">
                    Everything Included
                  </h4>
                  <ul className="space-y-4 text-base text-foreground/90">
                    {tierBenefits.paid.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4 pt-6 pb-10 px-8 sm:px-10 mt-auto bg-primary/5 border-t border-primary/10">
                <Button 
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing Scroll...</>
                  ) : (
                    'Unlock the Forge'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
