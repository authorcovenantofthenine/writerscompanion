import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Network, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import ProfileMenu from '@/components/ProfileMenu.jsx';
import MagicalButton from '@/components/MagicalButton.jsx';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const authLinks = [
    { path: '/app/dashboard', label: 'Dashboard' },
    { path: '/app/projects', label: 'Projects' },
    { path: '/relations-network', label: 'Network', icon: <Network className="w-4 h-4 mr-1 inline" /> },
    { path: '/app/settings', label: 'Settings' },
  ];

  const navLinks = currentUser ? authLinks : [];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/app/dashboard');
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      scrolled 
        ? 'bg-background/90 backdrop-blur-md border-b border-primary/20 shadow-[0_4px_30px_hsl(var(--background))]' 
        : 'bg-transparent border-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3 group">
            {currentUser && (
              <button
                onClick={handleHomeClick}
                className="p-2 rounded-lg transition-all duration-300 ease-out hover:bg-primary/15 hover:scale-110 active:scale-95 text-primary hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                title="Go to Dashboard"
                aria-label="Dashboard Home"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
            
            <Link to={currentUser ? "/app/dashboard" : "/"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full text-primary absolute inset-0 animate-pulse-glow" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-2xl font-cinzel-decorative font-bold text-gold-gradient tracking-wide">
                Quil Forge
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 text-sm font-cinzel tracking-wider transition-all duration-300 flex items-center ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                }`}
              >
                {link.icon}
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {currentUser ? (
              <ProfileMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <MagicalButton size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </MagicalButton>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary hover:bg-primary/10 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-primary/20 shadow-2xl py-6 px-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-lg font-cinzel transition-all flex items-center ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10 border-l-2 border-primary'
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            <div className="pt-6 mt-2 border-t border-primary/10 flex flex-col space-y-4">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-4 py-3 text-lg font-cinzel text-foreground hover:text-primary hover:bg-primary/5 rounded-lg text-left"
              >
                {theme === 'dark' ? (
                  <><Sun className="h-5 w-5 mr-3" /> Light Mode</>
                ) : (
                  <><Moon className="h-5 w-5 mr-3" /> Dark Mode</>
                )}
              </button>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-lg font-cinzel text-destructive hover:bg-destructive/10 rounded-lg text-left"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              ) : (
                <MagicalButton className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </MagicalButton>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;