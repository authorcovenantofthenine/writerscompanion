import React, { useState, useEffect } from 'react';
import { Save, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const defaultSettings = {
  includeChapterNumbers: true,
  includeChapterTitles: true,
  includeSceneSeparators: true,
  sceneSeparator: '***',
  fontFamily: 'System Default'
};

const ManuscriptSettingsPanel = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('quilforge_document_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        onSettingsChange(parsed);
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    } else {
      onSettingsChange(defaultSettings);
    }
  }, []);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    localStorage.setItem('quilforge_document_settings', JSON.stringify(settings));
    toast.success('Document settings saved');
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="w-5 h-5 text-primary" />
          Document Settings
        </CardTitle>
        <CardDescription>Configure how your notes and chapters are compiled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Typography</h4>
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={settings.fontFamily} onValueChange={(v) => handleChange('fontFamily', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="System Default">System Default</SelectItem>
                <SelectItem value="Serif">Serif (Classic)</SelectItem>
                <SelectItem value="Monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="inc-chap-num" className="cursor-pointer">Include Section Numbers</Label>
            <Switch 
              id="inc-chap-num" 
              checked={settings.includeChapterNumbers} 
              onCheckedChange={(v) => handleChange('includeChapterNumbers', v)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="inc-chap-title" className="cursor-pointer">Include Section Titles</Label>
            <Switch 
              id="inc-chap-title" 
              checked={settings.includeChapterTitles} 
              onCheckedChange={(v) => handleChange('includeChapterTitles', v)} 
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="inc-scene-sep" className="cursor-pointer">Content Separators</Label>
            <Switch 
              id="inc-scene-sep" 
              checked={settings.includeSceneSeparators} 
              onCheckedChange={(v) => handleChange('includeSceneSeparators', v)} 
            />
          </div>

          {settings.includeSceneSeparators && (
            <div className="space-y-2 pl-4 border-l-2 border-border/50">
              <Label>Separator Symbol</Label>
              <Select value={settings.sceneSeparator} onValueChange={(v) => handleChange('sceneSeparator', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="***">*** (Asterisks)</SelectItem>
                  <SelectItem value="---">--- (Dashes)</SelectItem>
                  <SelectItem value=" ">[Blank Line]</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button onClick={handleSave} className="w-full mt-4">
          <Save className="w-4 h-4 mr-2" /> Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManuscriptSettingsPanel;