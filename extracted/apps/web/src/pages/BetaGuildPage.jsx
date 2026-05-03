import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Lightbulb, ExternalLink, Shield } from 'lucide-react';
import SuggestionsTab from '@/components/SuggestionsTab.jsx';
import HomeButton from '@/components/HomeButton.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BetaGuildPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <Helmet>
        <title>Beta Guild - Quil Forge</title>
      </Helmet>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Beta Guild
          </h1>
          <p className="text-muted-foreground">Shape the future of Quil Forge and connect with fellow authors.</p>
        </div>
        <HomeButton />
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="suggestions"><Lightbulb className="w-4 h-4 mr-2" /> Suggestions</TabsTrigger>
          <TabsTrigger value="community"><Users className="w-4 h-4 mr-2" /> Community</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-0">
          <SuggestionsTab />
        </TabsContent>

        <TabsContent value="community" className="mt-0">
          <Card className="border-primary/20 shadow-md bg-card/50 backdrop-blur-sm max-w-2xl mx-auto mt-8">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Join the Authors Guild</CardTitle>
              <CardDescription className="text-base mt-2">
                Connect with other writers, share your progress, and get exclusive updates on new features.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 pt-4">
              <p className="text-muted-foreground">
                Our community is hosted on Skool, where you can participate in discussions, access writing resources, and interact directly with the development team.
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
                <a href="https://www.skool.com/quilauthorsguild" target="_blank" rel="noopener noreferrer">
                  Open Community Portal <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BetaGuildPage;