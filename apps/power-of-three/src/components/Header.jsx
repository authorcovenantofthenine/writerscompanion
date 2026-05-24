import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import TriquetraSymbol from '@/components/TriquetraSymbol.jsx';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-secondary/30 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity">
          <TriquetraSymbol className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          <div className="text-center md:text-left">
            <h1 className="font-display text-base sm:text-lg text-foreground text-balance">The Power of Three</h1>
            <p className="font-serif-display text-xs sm:text-sm text-primary uppercase tracking-widest hidden sm:block">Quil Authors Guild</p>
          </div>
        </Link>
        
        <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 mt-2 md:mt-0">
          {currentUser ? (
            <>
              <span className="font-serif-display text-sm text-foreground/80 italic hidden lg:block">
                {currentUser.email}
              </span>
              <Link 
                to="/dashboard" 
                className="text-foreground/80 hover:text-primary transition-colors font-display text-sm uppercase tracking-widest min-h-[44px] flex items-center"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-primary hover:text-primary/80 transition-colors font-display text-sm uppercase tracking-widest min-h-[44px] flex items-center"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="text-primary hover:text-primary/80 transition-colors font-display text-sm uppercase tracking-widest min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}