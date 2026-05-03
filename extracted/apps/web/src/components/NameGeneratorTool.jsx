import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Sparkles } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const NameGeneratorTool = () => {
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState([]);
  const [activeConvention, setActiveConvention] = useState('fantasy');

  const conventions = [
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'sci-fi', label: 'Sci-Fi' },
    { id: 'realistic', label: 'Realistic' },
    { id: 'historical', label: 'Historical' }
  ];

  const generateNames = async () => {
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convention: activeConvention, count: 10 })
      });
      
      if (!response.ok) throw new Error('Failed to generate names');
      
      const data = await response.json();
      setNames(data.names || []);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate names');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (name) => {
    navigator.clipboard.writeText(name);
    toast.success(`Copied "${name}" to clipboard`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {conventions.map(conv => (
          <Button
            key={conv.id}
            variant={activeConvention === conv.id ? 'default' : 'outline'}
            onClick={() => setActiveConvention(conv.id)}
            className="min-w-[100px]"
          >
            {conv.label}
          </Button>
        ))}
      </div>

      <Button onClick={generateNames} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Generate Names
      </Button>

      {names.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {names.map((name, idx) => (
            <Card key={idx} className="bg-card hover:border-primary/50 transition-colors group">
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-medium text-foreground">{name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => copyToClipboard(name)}
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NameGeneratorTool;