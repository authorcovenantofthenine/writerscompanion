import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const ManuscriptFiltersBar = ({ searchQuery, setSearchQuery, sortOption, setSortOption }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search manuscripts by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-64">
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-updated">Most Recently Edited</SelectItem>
            <SelectItem value="title">Alphabetically by Title</SelectItem>
            <SelectItem value="-created">Date Created</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ManuscriptFiltersBar;