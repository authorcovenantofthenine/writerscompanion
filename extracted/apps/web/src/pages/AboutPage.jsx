
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AboutPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <Helmet>
        <title>About Quil Forge — Built for Serious Fiction Writers</title>
        <meta name="description" content="Learn why we built Quil Forge — a writing platform that combines the power of Scrivener with a clean modern interface, built for novelists who want everything in one place." />
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
            <h1 className="text-gold-gradient mb-6">The Forging of the Quil</h1>
            <h3 className="text-muted-foreground max-w-3xl mx-auto">
              Born from the necessity of managing complex creative universes.
            </h3>
          </motion.div>
        </div>
      </section>

      <div className="page-break" />

      <section className="py-12 relative">
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-invert prose-lg max-w-none font-eb-garamond text-foreground/90"
          >
            <p className="text-2xl font-cormorant italic text-primary mb-8 text-center">
              "Traditional writing tools treat ideas like scattered documents. But creativity is a living system."
            </p>
            
            <p className="mb-6">
              We started Quil Forge because we saw talented writers struggling with the same challenges: tracking complex timelines, maintaining character consistency, organizing worldbuilding details, and keeping continuity across hundreds of notes.
            </p>
            
            <p className="mb-6">
              So we built a complete author system that helps you plan, write, and organize with confidence. Our writing assistant, Quil, doesn't write your ideas for you—it helps you manage them better by remembering details, catching inconsistencies, and offering intelligent suggestions based on your entire creative project.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
