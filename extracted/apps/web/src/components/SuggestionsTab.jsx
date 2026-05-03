import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Lightbulb, Bug, Sparkles, HelpCircle, Send, MessageSquarePlus } from 'lucide-react';

const CATEGORIES = [
  { value: 'Bug', label: 'Bug Report', icon: Bug, color: 'destructive' },
  { value: 'Feature Request', label: 'Feature Request', icon: Sparkles, color: 'primary' },
  { value: 'Improvement', label: 'Improvement', icon: Lightbulb, color: 'secondary' },
  { value: 'Other', label: 'Other', icon: HelpCircle, color: 'muted' }
];

const SuggestionsTab = () => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  const fetchSuggestions = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const result = await pb.collection('suggestions').getList(1, 50, {
        filter: `userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setSuggestions(result.items);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load your previous suggestions.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await pb.collection('suggestions').create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        userId: currentUser.id,
        projectId: currentProject?.id || null
      }, { $autoCancel: false });
      
      toast.success('Suggestion submitted successfully! Thank you for your feedback.');
      
      setFormData({
        title: '',
        description: '',
        category: ''
      });
      
      fetchSuggestions();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error(error.response?.message || 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryConfig = (categoryValue) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[3];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-primary/20 shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-primary" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Help us improve Quil Forge. Share your ideas, report bugs, or request new features.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                  required
                >
                  <SelectTrigger id="category" className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 opacity-70" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                <Input 
                  id="title"
                  placeholder="Brief summary of your feedback" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description <span className="text-destructive">*</span></label>
                <Textarea 
                  id="description"
                  placeholder="Provide as much detail as possible..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] bg-background resize-y"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> Submit Suggestion
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* List Section */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Your Previous Submissions</h3>
          <p className="text-sm text-muted-foreground mb-4">Track the status of feedback you've sent to the guild.</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={`skeleton-${i}`} className="border-border/50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24 mt-4" />
                </CardContent>
              </Card>
            ))
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl bg-muted/5">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h4 className="text-lg font-medium text-foreground mb-1">No suggestions yet</h4>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                You haven't submitted any feedback yet. Use the form to share your ideas with the developers!
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => {
              const config = getCategoryConfig(suggestion.category);
              const Icon = config.icon;
              
              return (
                <Card key={suggestion.id} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                      <h4 className="font-semibold text-lg leading-tight">{suggestion.title}</h4>
                      <Badge variant={config.color === 'destructive' ? 'destructive' : config.color === 'primary' ? 'default' : 'secondary'} className="shrink-0 w-fit">
                        <Icon className="w-3 h-3 mr-1.5" />
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap mb-4">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-3 border-t border-border/30">
                      <span>Submitted on {format(new Date(suggestion.created), 'MMM d, yyyy')}</span>
                      {suggestion.projectId && <span>Project Specific</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsTab;