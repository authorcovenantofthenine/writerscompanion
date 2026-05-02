import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Target, Flame, Calendar, Edit2, Check, BookDashed } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';

const WritingGoalsPage = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [isLoading, setIsLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('1000');
  
  const [todayWords, setTodayWords] = useState(0);
  const [historyData, setHistoryData] = useState([]);
  const [bestStreak, setBestStreak] = useState(0);
  const [monthWords, setMonthWords] = useState(0);

  useEffect(() => {
    if (!currentProject) return;
    
    const savedGoal = localStorage.getItem(`dailyGoal_${currentProject.id}`);
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
      setTempGoal(savedGoal);
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch today's scenes to calculate today's words
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const scenes = await pb.collection('scenes').getFullList({
          filter: `projectId = "${currentProject.id}"`,
          $autoCancel: false
        });
        
        let wordsToday = 0;
        scenes.forEach(scene => {
          const editedDate = new Date(scene.lastEdited || scene.updated);
          if (editedDate >= today) {
            wordsToday += (scene.wordCount || 0);
          }
        });
        setTodayWords(wordsToday);

        // Fetch writing history
        const history = await pb.collection('writing_history').getFullList({
          filter: `projectId = "${currentProject.id}" && userId = "${currentUser.id}"`,
          sort: '-date',
          $autoCancel: false
        });
        
        setHistoryData(history);

        // Calculate stats
        let currentStreak = 0;
        let maxStreak = 0;
        let wordsThisMonth = 0;
        
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Create a map of dates to word counts for easier streak calculation
        const historyMap = {};
        history.forEach(record => {
          const d = new Date(record.date);
          const dateStr = d.toISOString().split('T')[0];
          historyMap[dateStr] = (historyMap[dateStr] || 0) + record.word_count;
          
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            wordsThisMonth += record.word_count;
          }
        });
        
        // Add today's words to the map and month total if not already there
        const todayStr = today.toISOString().split('T')[0];
        if (wordsToday > 0) {
          historyMap[todayStr] = wordsToday;
          // If today wasn't in history yet, add to month words
          if (!history.find(h => new Date(h.date).toISOString().split('T')[0] === todayStr)) {
            wordsThisMonth += wordsToday;
          }
        }

        setMonthWords(wordsThisMonth);

        // Calculate best streak
        const sortedDates = Object.keys(historyMap).sort((a, b) => new Date(b) - new Date(a));
        let tempStreak = 0;
        
        // Simple streak calculation (consecutive days hitting goal)
        // Note: A real streak calculation would check consecutive calendar days, 
        // but for simplicity we'll just count consecutive entries that hit the goal.
        let lastDate = null;
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date();
          checkDate.setDate(today.getDate() - i);
          const checkStr = checkDate.toISOString().split('T')[0];
          
          const words = historyMap[checkStr] || 0;
          if (words >= dailyGoal) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }
        
        setBestStreak(maxStreak);

      } catch (error) {
        console.error('Error fetching goals data:', error);
        toast.error('Failed to load writing goals.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject, currentUser, dailyGoal]);

  const handleSaveGoal = () => {
    const parsed = parseInt(tempGoal, 10);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid number greater than 0.');
      return;
    }
    setDailyGoal(parsed);
    localStorage.setItem(`dailyGoal_${currentProject?.id}`, parsed.toString());
    setIsEditingGoal(false);
    toast.success('Daily goal updated.');
  };

  // Generate heatmap data (last 84 days)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    const historyMap = {};
    historyData.forEach(record => {
      const d = new Date(record.date);
      const dateStr = d.toISOString().split('T')[0];
      historyMap[dateStr] = (historyMap[dateStr] || 0) + record.word_count;
    });
    
    const todayStr = today.toISOString().split('T')[0];
    if (todayWords > 0) {
      historyMap[todayStr] = todayWords;
    }

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const words = historyMap[dateStr] || 0;
      
      let intensity = 0;
      if (words > 0) {
        if (words >= dailyGoal) intensity = 4;
        else if (words >= dailyGoal * 0.75) intensity = 3;
        else if (words >= dailyGoal * 0.5) intensity = 2;
        else intensity = 1;
      }
      
      days.push({
        date: d,
        dateStr,
        words,
        intensity
      });
    }
    return days;
  }, [historyData, todayWords, dailyGoal]);

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <BookDashed className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2 font-serif">No Project Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Open a project to track your writing goals.
          </p>
        </div>
      </AppLayout>
    );
  }

  const progressPercentage = Math.min(100, Math.round((todayWords / dailyGoal) * 100));
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  let statusMessage = '0 words — time to start';
  if (progressPercentage >= 100) statusMessage = 'Goal reached 🎉';
  else if (progressPercentage >= 75) statusMessage = 'Almost there!';
  else if (progressPercentage >= 50) statusMessage = 'Halfway there';
  else if (progressPercentage >= 25) statusMessage = 'Getting started';
  else if (progressPercentage > 0) statusMessage = 'Every word counts';

  return (
    <AppLayout>
      <Helmet>
        <title>Writing Goals - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif flex items-center gap-3 text-gold-gradient">
            <Target className="h-8 w-8 text-primary" />
            Writing Goals
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Track your daily progress and build your writing habit.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-80 w-full rounded-2xl bg-card/40" />
            <Skeleton className="h-64 w-full rounded-2xl bg-card/40" />
          </div>
        ) : (
          <>
            {/* Daily Goal Section */}
            <div className="bg-card/40 border border-border/50 rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <h2 className="text-2xl font-serif font-bold mb-2">Today's Target</h2>
                    {isEditingGoal ? (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Input 
                          type="number" 
                          value={tempGoal} 
                          onChange={(e) => setTempGoal(e.target.value)}
                          className="w-32 bg-background text-foreground"
                          autoFocus
                        />
                        <Button size="icon" onClick={handleSaveGoal} className="h-10 w-10">
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center md:justify-start gap-3 group">
                        <span className="text-4xl font-bold text-primary tracking-tight">
                          {dailyGoal.toLocaleString()} <span className="text-xl text-muted-foreground font-normal">words</span>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setIsEditingGoal(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground/90">
                      {statusMessage}
                    </p>
                    <p className="text-muted-foreground">
                      You've written <strong className="text-foreground">{todayWords.toLocaleString()}</strong> words today.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center shrink-0">
                  <svg width="220" height="220" className="transform -rotate-90">
                    {/* Background ring */}
                    <circle
                      cx="110"
                      cy="110"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      className="text-muted/20"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="110"
                      cy="110"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        progressPercentage >= 100 ? 'text-primary drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'text-primary/80'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold font-serif tracking-tighter">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Streak & History Section */}
            <div className="bg-card/40 border border-border/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-serif font-bold">Writing History</h2>
              </div>

              <div className="mb-10 overflow-x-auto pb-4">
                <div className="min-w-[700px]">
                  <TooltipProvider delayDuration={100}>
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                      {heatmapDays.map((day, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div 
                              className={`w-4 h-4 rounded-sm transition-colors duration-200 heatmap-cell-${day.intensity} border border-border/10`}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border/50">
                            <p className="font-medium">{day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <p className="text-sm text-muted-foreground">{day.words.toLocaleString()} words</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                  <div className="flex justify-end items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm heatmap-cell-0 border border-border/10" />
                    <div className="w-3 h-3 rounded-sm heatmap-cell-1 border border-border/10" />
                    <div className="w-3 h-3 rounded-sm heatmap-cell-2 border border-border/10" />
                    <div className="w-3 h-3 rounded-sm heatmap-cell-3 border border-border/10" />
                    <div className="w-3 h-3 rounded-sm heatmap-cell-4 border border-border/10" />
                    <span>More</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-background/50 rounded-xl p-6 border border-border/30 flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Best Streak</p>
                    <p className="text-3xl font-bold font-serif mt-1">{bestStreak} <span className="text-lg font-normal text-muted-foreground">days</span></p>
                  </div>
                </div>
                
                <div className="bg-background/50 rounded-xl p-6 border border-border/30 flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total This Month</p>
                    <p className="text-3xl font-bold font-serif mt-1">{monthWords.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">words</span></p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default WritingGoalsPage;