import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>The Power of Three</title>
        <meta name="description" content="You found your two. The circle is formed. What only three can do together begins now." />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center">
          
          {/* Triquetra Symbol */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-28 h-28 mx-auto mb-14 text-primary" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="50" cy="35" r="22" />
            <circle cx="38" cy="62" r="22" />
            <circle cx="62" cy="62" r="22" />
          </svg>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 text-center text-balance leading-tight">
            The <span className="text-primary italic font-serif-display font-normal">Power of Three</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground/90 text-center max-w-2xl mx-auto mb-20 leading-relaxed font-serif-body">
            You found your two. The circle is formed. What only three can do together begins now.
          </p>
          
          {/* Decorative Divider */}
          <div className="flex items-center gap-6 my-16 w-full max-w-md mx-auto opacity-70">
            <div className="flex-1 h-px bg-primary/40"></div>
            <div className="w-2 h-2 rotate-45 bg-primary"></div>
            <div className="flex-1 h-px bg-primary/40"></div>
          </div>
          
          {/* Quote Section */}
          <div className="max-w-2xl mx-auto mb-24 space-y-4">
            <p className="text-2xl md:text-3xl italic font-serif-display text-foreground/90 text-center leading-relaxed">
              The pen that writes. The eye that reads.
            </p>
            <p className="text-2xl md:text-3xl italic font-serif-display text-foreground/90 text-center leading-relaxed">
              The hand that shapes. Together, the work becomes.
            </p>
          </div>
          
          {/* Three Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mx-auto mb-24">
            
            {/* Card 1: The Writer */}
            <div className="border border-secondary/60 rounded-2xl p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,74,125,0.15)] bg-card/30 backdrop-blur-sm flex flex-col items-center">
              <h3 className="text-primary font-display text-2xl md:text-3xl mb-3 text-center tracking-wide uppercase">
                The Writer
              </h3>
              <p className="italic text-foreground/70 mb-6 text-center font-serif-display text-xl">
                The One Who Invokes
              </p>
              <p className="text-foreground/90 leading-relaxed text-center font-serif-body">
                You bring the vision into being. The first words, the first breath of the story. Your pen opens the door.
              </p>
            </div>
            
            {/* Card 2: The Beta Reader */}
            <div className="border border-secondary/60 rounded-2xl p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,74,125,0.15)] bg-card/30 backdrop-blur-sm flex flex-col items-center">
              <h3 className="text-primary font-display text-2xl md:text-3xl mb-3 text-center tracking-wide uppercase">
                The Beta Reader
              </h3>
              <p className="italic text-foreground/70 mb-6 text-center font-serif-display text-xl">
                The One Who Witnesses
              </p>
              <p className="text-foreground/90 leading-relaxed text-center font-serif-body">
                You hold the mirror to the work. Your eyes see what the writer cannot. You witness and reflect truth.
              </p>
            </div>
            
            {/* Card 3: The Editor */}
            <div className="border border-secondary/60 rounded-2xl p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,74,125,0.15)] bg-card/30 backdrop-blur-sm flex flex-col items-center">
              <h3 className="text-primary font-display text-2xl md:text-3xl mb-3 text-center tracking-wide uppercase">
                The Editor
              </h3>
              <p className="italic text-foreground/70 mb-6 text-center font-serif-display text-xl">
                The One Who Shapes
              </p>
              <p className="text-foreground/90 leading-relaxed text-center font-serif-body">
                You refine what has been made. Your hand shapes the rough into the polished. You complete the transformation.
              </p>
            </div>
            
          </div>

          {/* CONTEXT SECTION */}
          <motion.div 
            className="text-center mb-8 md:mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <p className="font-serif-display text-base md:text-lg text-[var(--parchment)] font-normal">
              A free critique circle tool for fiction writers. Part of Quil Authors Guild.
            </p>
          </motion.div>

          {/* THREE STEPS SECTION */}
          <motion.div 
            className="text-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <p className="font-serif-display text-sm md:text-base text-[var(--parchment)] italic opacity-85">
              1. Find your two. 2. Consecrate your circle. 3. Write, read, shape — together.
            </p>
          </motion.div>
          
          {/* CTA Button */}
          <div className="text-center pb-6 md:pb-8">
            <button 
              onClick={() => navigate('/setup')}
              className="bg-primary text-primary-foreground px-12 py-5 rounded-lg font-display text-xl font-bold hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,86,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
            >
              Consecrate Your Circle
            </button>
          </div>

          {/* SIGN-IN LINK */}
          <div className="text-center">
            <a 
              href="/login"
              className="font-serif-display text-sm md:text-base text-[var(--gold)] hover:underline transition-all duration-300 hover:text-[var(--gold)] hover:drop-shadow-[0_0_8px_rgba(212,175,86,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1"
            >
              Already have a circle? Sign in
            </a>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default HomePage;