import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, image, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-2xl premium-shadow hover:premium-shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden border border-border/50"
    >
      {image && (
        <div className="w-full aspect-video relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-foreground/5 mix-blend-overlay z-10 pointer-events-none" />
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h4 className="text-xl font-semibold mb-3 text-card-foreground">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;