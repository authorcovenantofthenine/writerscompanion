import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MagicalButton from '@/components/MagicalButton.jsx';

const ContactPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <Helmet>
        <title>Send a Raven - Quil Forge</title>
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
            <h1 className="text-gold-gradient mb-6">Send a Raven</h1>
            <h3 className="text-muted-foreground max-w-3xl mx-auto">
              Seek counsel from the masters of the forge.
            </h3>
          </motion.div>
        </div>
      </section>

      <div className="page-break" />

      <section className="py-12 relative">
        <div className="container mx-auto px-4 relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 rounded-2xl"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-cinzel text-primary mb-2">Your Name</label>
                <input type="text" className="w-full bg-background/50 border border-primary/30 rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block font-cinzel text-primary mb-2">Your Email</label>
                <input type="email" className="w-full bg-background/50 border border-primary/30 rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block font-cinzel text-primary mb-2">The Message</label>
                <textarea rows="5" className="w-full bg-background/50 border border-primary/30 rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"></textarea>
              </div>
              <MagicalButton className="w-full">Dispatch Raven</MagicalButton>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;