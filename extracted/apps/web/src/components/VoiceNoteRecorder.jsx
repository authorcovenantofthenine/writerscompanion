import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Square, Play, Loader2 } from 'lucide-react';
import { useProjectContext } from '@/hooks/useProjectContext.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const VoiceNoteRecorder = ({ onSuccess }) => {
  const { activeProject } = useProjectContext();
  const { currentUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSave = async () => {
    if (!activeProject || !audioBlob || !title) {
      toast.error('Please provide a title and record audio');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('audioFile', audioBlob, 'recording.webm');
      formData.append('projectId', activeProject.id);
      formData.append('userId', currentUser.id);
      // Mock transcription for now
      formData.append('transcription', 'Transcription pending...');

      await pb.collection('voice_notes').create(formData, { $autoCancel: false });
      
      toast.success('Voice note saved');
      setTitle('');
      setAudioBlob(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving voice note:', error);
      toast.error('Failed to save voice note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Note Title</Label>
        <Input 
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Villain's Monologue Idea"
          className="bg-background text-foreground"
        />
      </div>

      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
        {!audioBlob ? (
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-primary/10'}`}>
              <Mic className={`w-8 h-8 ${isRecording ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="flex gap-4">
              {!isRecording ? (
                <Button onClick={startRecording} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="w-4 h-4 mr-2" /> Stop
                </Button>
              )}
            </div>
            {isRecording && <p className="text-sm text-destructive font-medium">Recording in progress...</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-md" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setAudioBlob(null)}>
                Discard
              </Button>
              <Button onClick={handleSave} disabled={loading || !title}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;