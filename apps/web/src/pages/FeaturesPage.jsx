
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Pen, Globe, Clock, Users, Share2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const FeaturesPage = () => {
  const features = [{
    icon: Pen,
    title: 'Content Editor',
    description: 'Write and organize with purpose',
    details: 'Every note in Quil Forge has a clear purpose and structure. Define what needs to happen before you write, then focus on crafting the content.'
  }, {
    icon: Users,
    title: 'Character Creator',
    description: 'Develop deep, multi-dimensional characters',
    details: 'Go beyond basic physical descriptions. Build comprehensive psychological profiles, track character arcs, define motivations, and map complex relationship webs.'
  }, {
    icon: Globe,
    title: 'World Builder',
    description: 'Build rich, consistent universes',
    details: 'Create detailed locations, establish lore, define magic systems, and organize factions. Everything connects to your project timeline and character relationships.'
  }, {
    icon: Share2,
    title: 'Relationship Mapping',
    description: 'Visualize character connections and dynamics',
    details: 'Map out complex relationships between characters with visual connection lines, relationship types, and dynamic interactions. See how your characters influence each other across your project.'
  }, {
    icon: Clock,
    title: 'Timeline Creator',
    description: 'Keep your chronology crystal clear',
    details: 'Visualize your project timeline with events, character arcs, and plot developments. Filter by section, chapter, or character to see exactly when things happen.'
  }];

  return (
    <div className="bg-background min-h-screen">
      <Helmet>
        <title>Quil Forge Features — Manuscript Editor, Codex, Timeline & More</title>
        <meta name="description" content="Explore everything Quil Forge offers: distraction-free manuscript editing, character sheets, world-building tools, writing goals, and the unique Butter Method story analysis." />
      </Helmet>

      <Header />

      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-section-bg to-background" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gold-gradient mb-4">
              Writing & Organization Tools for Authors
            </h1>
            <h2 className="text-2xl md:text-3xl font-cormorant italic text-gold-gradient mb-6">
              The Tools of Creation
            </h2>
            <h3 className="text-muted-foreground max-w-3xl mx-auto">
              Powerful enchantments designed specifically for writers building complete creative universes.
            </h3>
          </motion.div>
        </div>
      </section>

      <div className="page-break" />

      {/* Features Section - Alternating Layout */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto space-y-24">
            {features.map((feature, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex flex-col gap-12 items-center">
                    
                    {/* Text Content */}
                    <div className="w-full">
                      <div className="glass-panel p-10 rounded-2xl relative group hover:gold-glow transition-all duration-500">
                        {/* Faint Rune Corner */}
                        <svg className="absolute top-4 right-4 w-16 h-16 text-primary opacity-5 group-hover:opacity-10 transition-opacity" viewBox="0 0 100 100">
                          <path d="M20 80 L80 20 M20 20 L80 80" stroke="currentColor" strokeWidth="2" />
                        </svg>

                        <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-8 bg-background/50 group-hover:border-primary transition-colors">
                          <feature.icon className="w-8 h-8 text-primary" />
                        </div>
                        
                        <h3 className="text-3xl font-cinzel mb-4 text-foreground">{feature.title}</h3>
                        <h4 className="text-xl text-primary mb-6">{feature.description}</h4>
                        <p className="text-muted-foreground leading-relaxed text-lg">{feature.details}</p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Tiers Showcase Section */}
      <section className="py-24 relative border-t border-border/50 bg-section-bg/30">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-gold-gradient mb-4">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Whether you're just starting your journey or weaving complex multiverses, there's a tier for every writer.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
