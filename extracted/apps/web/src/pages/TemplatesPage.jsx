import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutTemplate, BookOpen, FileText, MonitorSmartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTemplates } from '@/hooks/useTemplates.js';
import TemplateCard from '@/components/TemplateCard.jsx';
import TemplateUsageDialog from '@/components/TemplateUsageDialog.jsx';
import { motion } from 'framer-motion';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { templates, createManuscriptFromTemplate, isLoading } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'All Formats', icon: LayoutTemplate },
    { id: 'manuscript', name: 'Manuscript', icon: FileText },
    { id: 'print', name: 'Print Books', icon: BookOpen },
    { id: 'digital', name: 'Digital / Ebook', icon: MonitorSmartphone },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.fileRequirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleConfirmCreation = async (template, manuscriptName) => {
    const newManuscriptId = await createManuscriptFromTemplate(template, manuscriptName);
    if (newManuscriptId) {
      setIsDialogOpen(false);
      navigate(`/app/manuscript/${newManuscriptId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>Manuscript Templates - Quil Forge</title>
      </Helmet>

      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Formatting Templates</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Choose a professional layout for your manuscript. These read-only blueprints ensure your work meets strict industry specifications. Select a template to create a new, independently editable manuscript.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by title or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/50 border-border/50 focus-visible:ring-primary text-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[600px] rounded-2xl bg-card/40 border border-border/30 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <TemplateCard 
                template={template} 
                onUseTemplate={handleUseTemplate}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50">
          <LayoutTemplate className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      )}

      <TemplateUsageDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmCreation}
        template={selectedTemplate}
      />
    </div>
  );
};

export default TemplatesPage;