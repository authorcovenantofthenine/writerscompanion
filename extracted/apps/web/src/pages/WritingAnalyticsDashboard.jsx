import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Users, Clock, MapPin, AlertCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import HomeButton from '@/components/HomeButton.jsx';

const WritingAnalyticsDashboard = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  const [stats, setStats] = useState({
    totalWords: 0,
    activeCharacters: 0,
    timelineEvents: 0,
    totalLocations: 0
  });

  const [chartData, setChartData] = useState({
    wordCountTrend: [],
    characterFrequency: [],
    locationFrequency: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!currentProject || !currentUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const filter = `projectId = "${currentProject.id}" && userId = "${currentUser.id}"`;
        const options = { $autoCancel: false };

        // Fetch paginated scenes and other required data concurrently
        const [scenesData, characters, locations, timelineEvents] = await Promise.all([
          pb.collection('scenes').getList(currentPage, pageSize, { filter, ...options }),
          pb.collection('characters').getFullList({ filter, ...options }),
          pb.collection('locations').getFullList({ filter, ...options }),
          pb.collection('timeline_events').getFullList({ filter, ...options })
        ]);

        const scenes = scenesData.items;
        setTotalPages(scenesData.totalPages || 1);

        // 1. Calculate Total Words & Word Count Trend (Last 7 Days) for current page scenes
        let totalWords = 0;
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            id: `day-${i}`,
            dateStr: d.toISOString().split('T')[0],
            display: d.toLocaleDateString('en-US', { weekday: 'short' }),
            words: 0
          };
        });

        const allSceneContent = scenes.map(s => s.content || '').join(' ');

        scenes.forEach(scene => {
          const sceneWords = scene.wordCount || (scene.content ? scene.content.trim().split(/\s+/).length : 0);
          totalWords += sceneWords;

          const createdDate = new Date(scene.created).toISOString().split('T')[0];
          const dayMatch = last7Days.find(d => d.dateStr === createdDate);
          if (dayMatch) {
            dayMatch.words += sceneWords;
          }
        });

        // 2. Calculate Character Frequency (only for scenes on current page)
        const characterFreq = characters.map(char => {
          if (!char.name) return { id: char.id, name: 'Unknown', mentions: 0 };
          const regex = new RegExp(`\\b${char.name}\\b`, 'gi');
          const matches = allSceneContent.match(regex);
          return {
            id: char.id,
            name: char.name,
            mentions: matches ? matches.length : 0
          };
        })
        .filter(c => c.mentions > 0)
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10); // Top 10

        // 3. Calculate Location Frequency (only for scenes on current page)
        const locationFreq = locations.map(loc => {
          if (!loc.name) return { id: loc.id, name: 'Unknown', mentions: 0 };
          const regex = new RegExp(`\\b${loc.name}\\b`, 'gi');
          const matches = allSceneContent.match(regex);
          return {
            id: loc.id,
            name: loc.name,
            mentions: matches ? matches.length : 0
          };
        })
        .filter(l => l.mentions > 0)
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10);

        setStats({
          totalWords,
          activeCharacters: characters.length,
          timelineEvents: timelineEvents.length,
          totalLocations: locations.length
        });

        setChartData({
          wordCountTrend: last7Days,
          characterFrequency: characterFreq,
          locationFrequency: locationFreq
        });

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [currentProject, currentUser, currentPage]);

  if (!currentProject) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <Helmet><title>Analytics - Quil Forge</title></Helmet>
        <div className="flex justify-end mb-4"><HomeButton /></div>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground mb-6">Select or create a project to view its analytics.</p>
          <Button asChild size="lg" className="font-semibold">
            <Link to="/app/projects">Create Your First Project</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <Helmet><title>Analytics - Quil Forge</title></Helmet>
        <div className="flex justify-end mb-4"><HomeButton /></div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <Helmet>
        <title>Analytics - {currentProject.name} - Quil Forge</title>
      </Helmet>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Writing Analytics</h1>
          <p className="text-muted-foreground">Track your progress, character frequency, and world-building stats for {currentProject.name}.</p>
        </div>
        <HomeButton />
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={`skeleton-stat-${i}`} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Words (Current Page)</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalWords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Across {pageSize} scenes</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Characters</CardTitle>
                <Users className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.activeCharacters}</div>
                <p className="text-xs text-muted-foreground mt-1">Created in project</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Locations</CardTitle>
                <MapPin className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalLocations}</div>
                <p className="text-xs text-muted-foreground mt-1">World-building elements</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Timeline Events</CardTitle>
                <Clock className="w-4 h-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.timelineEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Plotted events</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData.wordCountTrend.some(d => d.words > 0) ? (
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Writing Output (Current Page Scenes)</CardTitle>
                  <CardDescription>Words written per day based on scene creation dates.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.wordCountTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="display" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Line type="monotone" dataKey="words" name="Words" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card shadow-sm flex flex-col items-center justify-center h-[400px] text-center p-6">
                <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <CardTitle className="mb-2">No Writing Data</CardTitle>
                <CardDescription>Write some scenes to see your daily word count trends.</CardDescription>
              </Card>
            )}

            {chartData.characterFrequency.length > 0 ? (
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Character Mentions (Current Page)</CardTitle>
                  <CardDescription>Most frequently mentioned characters in these scenes.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.characterFrequency} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Bar dataKey="mentions" name="Mentions" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card shadow-sm flex flex-col items-center justify-center h-[400px] text-center p-6">
                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <CardTitle className="mb-2">No Character Mentions</CardTitle>
                <CardDescription>Create characters and mention them in your scenes to see frequency stats.</CardDescription>
              </Card>
            )}

            {chartData.locationFrequency.length > 0 && (
              <Card className="bg-card shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle>Location References (Current Page)</CardTitle>
                  <CardDescription>Most frequently referenced locations in these scenes.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.locationFrequency} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Bar dataKey="mentions" name="References" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WritingAnalyticsDashboard;