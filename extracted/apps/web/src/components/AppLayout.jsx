import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { useFeatureAccess } from '@/hooks/useFeatureAccess.js';
import HomeButton from '@/components/HomeButton.jsx';
import AutoSaveIndicator from '@/components/AutoSaveIndicator.jsx';
import { 
  LayoutDashboard, 
  FolderOpen, 
  BookMarked, 
  Users, 
  Network, 
  Clock, 
  KeyRound as UsersRound, 
  Lock, 
  LogOut, 
  Settings, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Library,
  BarChart3,
  FileText,
  BookOpen,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { toast } from 'sonner';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { canAccess, currentLevel } = useFeatureAccess();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { 
      name: 'Projects', 
      icon: FolderOpen, 
      subItems: [
        { name: 'All Projects', path: '/app/projects' },
        { name: 'Books', path: '/app/projects/books' },
        { name: 'Chapters', path: '/app/chapters' }
      ]
    },
    { name: 'Manuscript', path: '/app/manuscript', icon: FileText },
    { name: 'Writing Goals', path: '/app/goals', icon: Target },
    { name: 'World Builder', path: '/app/architect', icon: BookMarked },
    { name: 'Characters', path: '/app/characters', icon: Users },
    { name: 'Codex', path: '/app/codex', icon: BookOpen },
    { 
      name: 'Relationships', 
      icon: Network, 
      feature: 'relationships',
      subItems: [
        { name: 'Overview', path: '/app/relationships' },
        { name: 'Relations Network', path: '/relations-network' }
      ]
    },
    { name: 'Timeline', path: '/app/timeline', icon: Clock, feature: 'timeline' },
    { name: 'References', path: '/app/references', icon: Library },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { name: 'Beta Guild', path: '/app/beta-guild', icon: UsersRound, feature: 'beta_guild' },
  ];

  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initialState = {};
    navItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path))) {
        initialState[item.name] = true;
      }
    });
    return initialState;
  });

  useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path))) {
        setExpandedMenus(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  const handleNavClick = (e, item) => {
    if (item.feature && !canAccess(item.feature)) {
      e.preventDefault();
      toast.error(`${item.name} is a premium feature. Upgrade to unlock.`);
      navigate('/subscription');
    }
  };

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <AutoSaveIndicator />
      <div className="flex flex-1 h-screen overflow-hidden">
        <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-md flex flex-col z-20 h-full transition-colors duration-300">
          <div className="p-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Quil Forge</h2>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4">
            {navItems.map(item => {
              if (item.feature === 'beta_guild' && !canAccess('beta_guild')) return null;

              const isLocked = item.feature && !canAccess(item.feature);
              
              if (item.external) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isLocked
                        ? 'text-muted-foreground/70 hover:bg-muted/50 cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isLocked && <Lock className="w-3.5 h-3.5 opacity-60" />}
                  </a>
                );
              }

              if (item.subItems) {
                const isExpanded = expandedMenus[item.name];
                const hasActiveChild = item.subItems.some(sub => location.pathname.startsWith(sub.path));

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={(e) => {
                        if (isLocked) {
                          handleNavClick(e, item);
                        } else {
                          toggleMenu(item.name);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        hasActiveChild && !isExpanded
                          ? 'bg-primary/15 text-primary font-medium shadow-sm'
                          : isLocked
                            ? 'text-muted-foreground/70 hover:bg-muted/50 cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${hasActiveChild && !isExpanded ? 'text-primary' : ''}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLocked && <Lock className="w-3.5 h-3.5 opacity-60" />}
                        {!isLocked && (
                          isExpanded ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && !isLocked && (
                      <div className="pl-9 pr-2 space-y-1 mt-1">
                        {item.subItems.map(sub => {
                          const isSubActive = location.pathname === sub.path || (sub.path !== '/app/projects' && location.pathname.startsWith(sub.path));
                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                isSubActive
                                  ? 'bg-primary/15 text-primary font-medium shadow-sm'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/15 text-primary font-medium shadow-sm' 
                      : isLocked
                        ? 'text-muted-foreground/70 hover:bg-muted/50'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                  {isLocked && <Lock className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border/50 space-y-2">
            {currentLevel === 0 && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-primary font-medium mb-2">Unlock your full potential</p>
                <Button size="sm" className="w-full text-xs h-8" onClick={() => navigate('/subscription')}>
                  Upgrade Now
                </Button>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground" 
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <><Sun className="w-4 h-4 mr-3" /> Light Mode</>
              ) : (
                <><Moon className="w-4 h-4 mr-3" /> Dark Mode</>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/app/settings')}>
              <Settings className="w-4 h-4 mr-3" /> Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
              <LogOut className="w-4 h-4 mr-3" /> Logout
            </Button>
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="sticky top-0 z-40 w-full flex justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto">
              <HomeButton />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 pt-0 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;