import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle, Users2, Feather, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <footer className="relative bg-background pt-24 pb-12 overflow-hidden border-t border-primary/20">
      {/* Candlelight Glow Top Edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Rune Watermark */}
      <svg className="rune-watermark w-96 h-96 -right-20 -bottom-20 opacity-[0.03]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </svg>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {currentUser ? (
          <div className="flex flex-col items-center justify-center space-y-8 mb-16">
            <Link to="/app/dashboard" className="inline-block">
              <span className="text-3xl font-cinzel-decorative font-bold text-gold-gradient">
                Quil Forge
              </span>
            </Link>
            <div className="flex space-x-8">
              <Link to="/app/settings" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-eb-garamond">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center text-muted-foreground hover:text-destructive transition-colors font-eb-garamond">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="md:col-span-6 space-y-6">
              <Link to="/" className="inline-block">
                <span className="text-3xl font-cinzel-decorative font-bold text-gold-gradient">
                  Quil Forge
                </span>
              </Link>
              <p className="text-xl font-cormorant italic text-muted-foreground max-w-md">
                "Where stories come alive with magic."
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-md leading-relaxed">
                The enchanted writing system for authors building complete story universes. Plan, write, and weave your narrative with powerful tools.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-cinzel text-lg text-foreground mb-6 tracking-wider">The Grimoire</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-eb-garamond">Home</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors font-eb-garamond">Sign In</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-cinzel text-lg text-foreground mb-6 tracking-wider">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/writingwithquil/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.threads.com/@writingwithquil" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/@QuilAuthorsGuild" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://www.skool.com/quilauthorsguild" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  <Users2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-muted-foreground text-sm font-eb-garamond">
            <span>© {currentYear} Quil Forge. All rights reserved.</span>
            <Feather className="w-4 h-4 mx-3 text-primary animate-float" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;