import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const PricingCard = ({ 
  name, 
  price, 
  tagline, 
  desc, 
  conversionHook, 
  hookStyle, 
  included = [], 
  excluded = [], 
  style, 
  badge, 
  buttonText, 
  buttonStyle = 'solid',
  delay = 0,
  onAction,
  isLoading
}) => {
  const isSolid = buttonStyle === 'solid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-2xl border p-8 h-full flex flex-col ${style}`}
    >
      {badge && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full font-cinzel text-sm font-bold shadow-[0_0_15px_hsl(var(--primary)/0.5)] tracking-wider uppercase whitespace-nowrap">
          {badge}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-3xl font-cinzel mb-2">{name}</h2>
        <p className="text-sm font-cinzel text-muted-foreground uppercase tracking-wider mb-4">{tagline}</p>
        <div className="mb-4">
          <span className="text-5xl font-bold text-foreground">{price}</span>
        </div>
        <p className="text-muted-foreground font-cormorant italic text-lg leading-snug">{desc}</p>
      </div>

      {conversionHook && (
        <div className={`p-4 mb-8 rounded-r-lg text-sm italic font-cormorant ${hookStyle}`}>
          "{conversionHook}"
        </div>
      )}
      
      <div className="flex-grow space-y-6 mb-10">
        {included.length > 0 && (
          <div>
            <h4 className="text-sm font-cinzel text-foreground mb-4 uppercase tracking-wider border-b border-border pb-2">Included Magic</h4>
            <ul className="space-y-3">
              {included.map((feat, i) => (
                <li key={i} className="flex items-start text-foreground/90 text-sm leading-relaxed">
                  <Check className="w-4 h-4 text-primary mr-3 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {excluded.length > 0 && (
          <div>
            <h4 className="text-sm font-cinzel text-muted-foreground mb-4 uppercase tracking-wider border-b border-border pb-2 mt-6">Not Included</h4>
            <ul className="space-y-3">
              {excluded.map((feat, i) => (
                <li key={i} className="flex items-start text-muted-foreground/60 text-sm leading-relaxed">
                  <X className="w-4 h-4 text-muted-foreground/40 mr-3 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onAction}
          disabled={isLoading}
          className={`w-full py-4 px-8 flex items-center justify-center text-center text-sm md:text-base font-bold tracking-widest uppercase rounded-full transition-all duration-300 ${
            isSolid 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:brightness-110' 
              : 'bg-transparent border-[3px] border-primary text-primary hover:bg-primary/10 hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : buttonText}
        </button>
      </div>
    </motion.div>
  );
};

export default PricingCard;