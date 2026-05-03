import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Check, ChevronRight, Loader2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import pb from '@/lib/pocketbaseClient.js';

const GettingStartedChecklist = () => {
  const navigate = useNavigate();
  const [checklistState, setChecklistState] = useState({
    hasProjects: false,
    hasCharacters: false,
    hasScenes: false,
    loading: true
  });

  useEffect(() => {
    const fetchChecklistData = async () => {
      try {
        const [projectsResult, charactersResult, scenesResult] = await Promise.all([
          pb.collection('projects').getList(1, 1, { 
            filter: `userId = "${pb.authStore.model?.id}"`,
            $autoCancel: false 
          }),
          pb.collection('characters').getList(1, 1, { 
            filter: `userId = "${pb.authStore.model?.id}"`,
            $autoCancel: false 
          }),
          pb.collection('scenes').getList(1, 1, { 
            filter: `userId = "${pb.authStore.model?.id}"`,
            $autoCancel: false 
          })
        ]);

        setChecklistState({
          hasProjects: projectsResult.totalItems > 0,
          hasCharacters: charactersResult.totalItems > 0,
          hasScenes: scenesResult.totalItems > 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching checklist data:', error);
        setChecklistState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchChecklistData();
  }, []);

  const checklistItems = [
    {
      id: 1,
      title: 'Create your first project',
      completed: checklistState.hasProjects,
      path: '/app/projects'
    },
    {
      id: 2,
      title: 'Add a character to the Codex',
      completed: checklistState.hasCharacters,
      path: '/app/codex'
    },
    {
      id: 3,
      title: 'Open the manuscript editor and write your first scene',
      completed: checklistState.hasScenes,
      path: '/app/manuscript'
    }
  ];

  if (checklistState.loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-lg">Getting Started</CardTitle>
        <p className="text-sm text-muted-foreground">Complete these steps to unlock the full power of Quil Forge</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklistItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-200 text-left group"
          >
            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              item.completed 
                ? 'bg-primary border-primary' 
                : 'border-muted-foreground/30 group-hover:border-primary/50'
            }`}>
              {item.completed && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
            <span className={`flex-1 text-sm font-medium transition-colors ${
              item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}>
              {item.title}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

const WritingStreakCard = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStreak = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const records = await pb.collection('writing_history').getList(1, 100, {
          filter: `userId = "${pb.authStore.model?.id}" && date >= "${thirtyDaysAgoStr}"`,
          sort: '-date',
          $autoCancel: false
        });

        // Calculate consecutive days from today backwards
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create a set of dates with writing entries
        const writingDates = new Set(
          records.items.map(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime();
          })
        );

        // Check consecutive days starting from today
        let checkDate = new Date(today);
        while (true) {
          const checkTime = checkDate.getTime();
          if (writingDates.has(checkTime)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // If today has no entry, check yesterday to allow for ongoing streaks
            if (currentStreak === 0) {
              checkDate.setDate(checkDate.getDate() - 1);
              if (writingDates.has(checkDate.getTime())) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
              }
            }
            break;
          }
        }

        setStreak(currentStreak);
        setLoading(false);
      } catch (error) {
        console.error('Error calculating writing streak:', error);
        setLoading(false);
      }
    };

    calculateStreak();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
        <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Calculating...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {streak} {streak === 1 ? 'day' : 'days'}
            </div>
            {streak > 0 && (
              <p className="text-xs text-muted-foreground">Keep the fire burning!</p>
            )}
            {streak === 0 && (
              <p className="text-xs text-muted-foreground">Start writing to begin your streak</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { projects } = useProject();
  const navigate = useNavigate();

  const hasProjects = projects && projects.length > 0;

  return (
    <AppLayout>
      <Helmet>
        <title>Dashboard - Quil Forge</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold-gradient">Welcome back, {currentUser?.name || 'Author'}</h1>
          <p className="text-muted-foreground mt-1">Ready to weave some magic today?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
            </CardContent>
          </Card>
          
          <WritingStreakCard />
        </div>

        {!hasProjects && (
          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-balance">Your story starts here</h3>
              <p className="text-muted-foreground mb-6 max-w-md text-balance">
                Every great tale begins with a single step. Create your first project and bring your world to life.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/app/projects')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create First Project
              </Button>
            </Card>

            <GettingStartedChecklist />
          </div>
        )}

        {hasProjects && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-gold-gradient">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map(project => (
                <Card key={project.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/app/projects">Open Project</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;