import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Search, Tags, FolderTree, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrossLinkManager from '@/components/CrossLinkManager.jsx';
import HomeButton from '@/components/HomeButton.jsx';

const SearchAndOrganizePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <Helmet>
        <title>Search & Organize - Quil Forge</title>
      </Helmet>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Search & Organize</h1>
          <p className="text-muted-foreground">Find anything across your entire project universe.</p>
        </div>
        <HomeButton />
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dialogue, notes, characters..."
          className="pl-10 h-12 text-lg bg-card text-foreground border-border"
        />
      </div>

      <Tabs defaultValue="crosslinks" className="w-full mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="crosslinks"><Network className="w-4 h-4 mr-2" /> Cross-Links</TabsTrigger>
          <TabsTrigger value="tags"><Tags className="w-4 h-4 mr-2" /> Tags</TabsTrigger>
          <TabsTrigger value="folders"><FolderTree className="w-4 h-4 mr-2" /> Folders</TabsTrigger>
        </TabsList>

        <TabsContent value="crosslinks">
          <CrossLinkManager />
        </TabsContent>

        <TabsContent value="tags">
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <Tags className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Tag Management</h3>
            <p className="text-muted-foreground">Organize your notes with custom color-coded tags.</p>
          </div>
        </TabsContent>

        <TabsContent value="folders">
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <FolderTree className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Project Folders</h3>
            <p className="text-muted-foreground">Drag and drop to organize your project structure.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchAndOrganizePage;