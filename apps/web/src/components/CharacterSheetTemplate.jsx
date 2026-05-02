import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Fingerprint, Eye, Brain, Heart, BookOpen, Users, TrendingUp, Swords, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'identity', title: 'Core Identity', icon: Fingerprint, color: 'var(--sheet-accent-identity)' },
  { id: 'physical', title: 'Physical Presence', icon: Eye, color: 'var(--sheet-accent-physical)' },
  { id: 'psychology', title: 'Psychology', icon: Brain, color: 'var(--sheet-accent-psych)' },
  { id: 'personality', title: 'Personality', icon: Heart, color: 'var(--sheet-accent-personality)' },
  { id: 'backstory', title: 'Backstory', icon: BookOpen, color: 'var(--sheet-accent-backstory)' },
  { id: 'relationships', title: 'Relationships', icon: Users, color: 'var(--sheet-accent-relationships)' },
  { id: 'arc', title: 'Story Arc', icon: TrendingUp, color: 'var(--sheet-accent-arc)' },
  { id: 'skills', title: 'Skills & Weaknesses', icon: Swords, color: 'var(--sheet-accent-skills)' },
  { id: 'stakes', title: 'Stakes', icon: AlertTriangle, color: 'var(--sheet-accent-stakes)' },
];

const CharacterSheetTemplate = ({ data, onChange }) => {
  const [openSections, setOpenSections] = useState(['identity']);

  const toggleSection = (id) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const expandAll = () => setOpenSections(SECTIONS.map(s => s.id));
  const collapseAll = () => setOpenSections([]);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const renderInput = (id, label, placeholder = '', type = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Input
        id={id}
        type={type}
        value={data[id] || ''}
        onChange={(e) => handleChange(id, e.target.value)}
        placeholder={placeholder}
        className="sheet-input"
      />
    </div>
  );

  const renderTextarea = (id, label, placeholder = '', rows = 3) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Textarea
        id={id}
        value={data[id] || ''}
        onChange={(e) => handleChange(id, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="sheet-input resize-y"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={expandAll} className="text-xs h-8">
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs h-8">
          Collapse All
        </Button>
      </div>

      <div className="space-y-4">
        {/* CORE IDENTITY */}
        <Collapsible open={openSections.includes('identity')} onOpenChange={() => toggleSection('identity')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Fingerprint className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-identity))' }} />
              <h3 className="text-lg font-semibold font-serif">Core Identity</h3>
            </div>
            {openSections.includes('identity') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('name', 'Full Name *', 'e.g. Elara Vance')}
              {renderInput('nickname', 'Nickname(s)', 'e.g. El')}
              {renderInput('age', 'Age', 'e.g. 24')}
              {renderInput('pronouns', 'Gender / Pronouns', 'e.g. She/Her')}
              {renderInput('role', 'Role in Story *', 'e.g. Protagonist, Mentor')}
              {renderInput('archetype', 'Archetype', 'e.g. The Reluctant Hero')}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* PHYSICAL PRESENCE */}
        <Collapsible open={openSections.includes('physical')} onOpenChange={() => toggleSection('physical')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-physical))' }} />
              <h3 className="text-lg font-semibold font-serif">Physical Presence</h3>
            </div>
            {openSections.includes('physical') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              {renderTextarea('appearance', 'General Appearance', 'Build, hair, eyes, typical clothing...', 3)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('distinguishingFeatures', 'Distinguishing Features', 'Scars, tattoos, unique traits...', 2)}
                {renderTextarea('bodyLanguage', 'Body Language & Posture', 'How do they carry themselves?', 2)}
              </div>
              {renderInput('voice', 'Voice & Speech Patterns', 'Accent, vocabulary, tone...')}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* PSYCHOLOGY */}
        <Collapsible open={openSections.includes('psychology')} onOpenChange={() => toggleSection('psychology')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Brain className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-psych))' }} />
              <h3 className="text-lg font-semibold font-serif">Psychology</h3>
            </div>
            {openSections.includes('psychology') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('coreDesire', 'Core Desire (Want)', 'What do they think will make them happy?', 2)}
                {renderTextarea('coreFear', 'Core Fear', 'What are they terrified of happening?', 2)}
                {renderTextarea('misbelief', 'The Lie / Misbelief', 'What false belief do they hold about the world?', 2)}
                {renderTextarea('emotionalWound', 'Emotional Wound (Ghost)', 'What past trauma caused the misbelief?', 2)}
              </div>
              {renderTextarea('internalConflict', 'Internal Conflict', 'How do their desires and fears clash?', 2)}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* PERSONALITY */}
        <Collapsible open={openSections.includes('personality')} onOpenChange={() => toggleSection('personality')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-personality))' }} />
              <h3 className="text-lg font-semibold font-serif">Personality</h3>
            </div>
            {openSections.includes('personality') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('traits', 'Dominant Traits', 'e.g. Loyal, stubborn, quick-witted', 2)}
                {renderTextarea('contradictions', 'Contradictions', 'e.g. Ruthless in battle, gentle with animals', 2)}
                {renderTextarea('habits', 'Habits & Quirks', 'Nervous tics, daily routines...', 2)}
                {renderTextarea('humor', 'Sense of Humor', 'Dry, slapstick, non-existent?', 2)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* BACKSTORY */}
        <Collapsible open={openSections.includes('backstory')} onOpenChange={() => toggleSection('backstory')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-backstory))' }} />
              <h3 className="text-lg font-semibold font-serif">Backstory</h3>
            </div>
            {openSections.includes('backstory') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              {renderTextarea('backstoryEvents', 'Key Past Events', 'Bullet points of major life events...', 4)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('shapingRelationships', 'Relationships That Shaped Them', 'Parents, mentors, first loves...', 2)}
                {renderTextarea('biggestRegret', 'Biggest Regret', 'What do they wish they could undo?', 2)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* RELATIONSHIPS */}
        <Collapsible open={openSections.includes('relationships')} onOpenChange={() => toggleSection('relationships')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-relationships))' }} />
              <h3 className="text-lg font-semibold font-serif">Relationships</h3>
            </div>
            {openSections.includes('relationships') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextarea('relAlly', 'Closest Ally', 'Who do they trust most?', 2)}
              {renderTextarea('relRival', 'Main Rival / Enemy', 'Who opposes them?', 2)}
              {renderTextarea('relLove', 'Love Interest', 'Romantic or platonic deep bond', 2)}
              {renderTextarea('relDynamic', 'Dynamic with Protagonist/Antagonist', 'How do they interact with the main forces?', 2)}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* STORY ARC */}
        <Collapsible open={openSections.includes('arc')} onOpenChange={() => toggleSection('arc')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-arc))' }} />
              <h3 className="text-lg font-semibold font-serif">Story Arc</h3>
            </div>
            {openSections.includes('arc') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('arcStart', 'Starting State', 'Who are they at the beginning?', 2)}
                {renderTextarea('arcMidpoint', 'Midpoint Shift', 'How does their perspective change?', 2)}
                {renderTextarea('arcClimax', 'Climax Decision', 'What hard choice must they make?', 2)}
                {renderTextarea('arcEnd', 'Ending State', 'Who are they at the end?', 2)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* SKILLS & WEAKNESSES */}
        <Collapsible open={openSections.includes('skills')} onOpenChange={() => toggleSection('skills')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <Swords className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-skills))' }} />
              <h3 className="text-lg font-semibold font-serif">Skills & Weaknesses</h3>
            </div>
            {openSections.includes('skills') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextarea('skills', 'Strengths & Skills', 'What are they naturally good at?', 2)}
                {renderTextarea('weaknesses', 'Weaknesses & Flaws', 'What holds them back?', 2)}
              </div>
              {renderTextarea('specialAbilities', 'Special Abilities / Knowledge', 'Magic, unique training, rare skills...', 2)}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* STAKES */}
        <Collapsible open={openSections.includes('stakes')} onOpenChange={() => toggleSection('stakes')} className="sheet-section">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--sheet-accent-stakes))' }} />
              <h3 className="text-lg font-semibold font-serif">Stakes</h3>
            </div>
            {openSections.includes('stakes') ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextarea('stakesFail', 'If They Fail...', 'What is the personal cost of failure?', 3)}
              {renderTextarea('stakesSucceed', 'If They Succeed...', 'What do they gain (or lose) by winning?', 3)}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default CharacterSheetTemplate;