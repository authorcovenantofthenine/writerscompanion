import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Save, Edit2, User } from 'lucide-react';
import AppLayout from '@/components/AppLayout.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CharacterPage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [character, setCharacter] = useState({
    name: 'Elena Thornwood',
    role: 'Protagonist',
    age: '24',
    personality: 'Curious, determined, cautious but brave when necessary. Values knowledge and truth above all else.',
    background: 'Raised in the Scholar\'s Quarter, Elena spent her childhood in the Great Library. Her parents were both historians who disappeared during an expedition when she was 16.',
    relationships: 'Close friend of Marcus (childhood friend), Suspicious of the Council of Elders, Mentored by Archivist Theron',
    notes: 'Discovers she has latent magical abilities tied to the ancient artifacts. Her journey is about accepting her destiny while honoring her scholarly roots.',
  });

  const timelineEvents = [
    { date: 'Chapter 1', event: 'Discovers the first clue in the library archives' },
    { date: 'Chapter 2', event: 'Meets Marcus and decides to investigate together' },
    { date: 'Chapter 3', event: 'Finds the Temple of the Ancients and the artifact' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'Changes saved',
      description: 'Character profile updated successfully.',
    });
  };

  return (
    <AppLayout>
      <Helmet>
        <title>{`${character.name} - Quil Forge`}</title>
        <meta name="description" content={`Character profile for ${character.name} in your Quil Forge story.`} />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="mb-2">Character Profile</h1>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="transition-all duration-200 active:scale-[0.98]"
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-16 w-16 text-primary" />
              </div>
              
              <div className="text-center mb-6">
                {isEditing ? (
                  <Input
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    className="text-center font-semibold text-xl mb-2 bg-background text-foreground"
                  />
                ) : (
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">{character.name}</h3>
                )}
                {isEditing ? (
                  <Input
                    value={character.role}
                    onChange={(e) => setCharacter({ ...character, role: e.target.value })}
                    className="text-center bg-background text-muted-foreground"
                  />
                ) : (
                  <p className="text-muted-foreground">{character.role}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-card-foreground">Age</Label>
                  {isEditing ? (
                    <Input
                      value={character.age}
                      onChange={(e) => setCharacter({ ...character, age: e.target.value })}
                      className="mt-1 bg-background text-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground mt-1">{character.age}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Personality</h3>
              {isEditing ? (
                <Textarea
                  value={character.personality}
                  onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
                  rows={3}
                  className="bg-background text-foreground"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{character.personality}</p>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Background</h3>
              {isEditing ? (
                <Textarea
                  value={character.background}
                  onChange={(e) => setCharacter({ ...character, background: e.target.value })}
                  rows={4}
                  className="bg-background text-foreground"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{character.background}</p>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Relationships</h3>
              {isEditing ? (
                <Textarea
                  value={character.relationships}
                  onChange={(e) => setCharacter({ ...character, relationships: e.target.value })}
                  rows={3}
                  className="bg-background text-foreground"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{character.relationships}</p>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Timeline</h3>
              <div className="space-y-3">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-card-foreground">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 premium-shadow">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Notes</h3>
              {isEditing ? (
                <Textarea
                  value={character.notes}
                  onChange={(e) => setCharacter({ ...character, notes: e.target.value })}
                  rows={4}
                  className="bg-background text-foreground"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{character.notes}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CharacterPage;