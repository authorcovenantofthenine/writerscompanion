
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Feather, X } from 'lucide-react';

export default function RateLimitMessage({ 
  isVisible = true,
  onDismiss, 
  message = "You've reached your daily AI limit. Upgrade to Writer to keep the momentum going."
}) {
  const parts = message.split('Upgrade to Writer');
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', y: 0, marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, y: -10, marginBottom: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rate-limit-banner group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 relative z-10">
            <Feather className="w-4 h-4 text-primary/80" />
          </div>
          
          <div className="flex-1 pr-8 relative z-10 py-1">
            <p className="text-base md:text-lg font-cormorant italic leading-relaxed text-foreground/80">
              {parts.length > 1 ? (
                <>
                  {parts[0]}
                  <Link 
                    to="/pricing" 
                    className="text-primary/90 hover:text-primary transition-colors underline decoration-primary/30 hover:decoration-primary underline-offset-4 font-medium"
                  >
                    Upgrade to Writer
                  </Link>
                  {parts[1]}
                </>
              ) : (
                message
              )}
            </p>
          </div>
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="absolute right-3 top-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all z-10"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
