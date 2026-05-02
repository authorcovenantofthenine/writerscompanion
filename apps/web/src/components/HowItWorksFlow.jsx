import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, FileText, Pen, Globe, Share2 } from 'lucide-react';

const HowItWorksFlow = () => {
  const steps = [
    { icon: Lightbulb, title: 'Start your idea', description: 'Begin with a concept or premise' },
    { icon: FileText, title: 'Build your outline', description: 'Structure your story framework' },
    { icon: Pen, title: 'Write scene by scene', description: 'Craft each moment with purpose' },
    { icon: Globe, title: 'Build your world', description: 'Develop characters and settings' },
    { icon: Share2, title: 'Publish to QuilVerse', description: 'Share with your audience' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <step.icon className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
          
          {index < steps.length - 1 && (
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default HowItWorksFlow;