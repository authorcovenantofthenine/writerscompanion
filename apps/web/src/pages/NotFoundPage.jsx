
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <Helmet>
        <title>Page Not Found | Quil Forge</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      <Header />

      <main className="flex-grow flex items-center justify-center relative py-24 px-4 overflow-hidden mt-16">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-60" />
          
          {/* Subtle Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[20rem] font-black text-primary/5 font-playfair tracking-tighter select-none mix-blend-overlay">
            404
          </div>
          
          {/* Gold Mist */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-primary/5 to-transparent opacity-50" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 relative glass-panel group">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
            <Feather className="w-8 h-8 text-primary/80 group-hover:text-primary transition-colors duration-500" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gold-gradient mb-6 tracking-tight text-balance drop-shadow-sm">
            This page has gone off-script.
          </h1>
          
          <h2 className="text-xl md:text-2xl font-cormorant italic text-muted-foreground mb-10 max-w-lg text-balance leading-relaxed">
            The chapter you're looking for doesn't exist — but your next one is waiting.
          </h2>

          <Button 
            asChild 
            size="lg" 
            className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] rounded-full tracking-widest uppercase text-sm font-bold group"
          >
            <Link to="/">
              Return to Your Story
            </Link>
          </Button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
