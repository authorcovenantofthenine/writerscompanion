import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Brain, Coffee, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

const MODES = {
  focus: { label: 'Focus', minutes: 25, icon: Brain },
  shortBreak: { label: 'Short Break', minutes: 5, icon: Coffee },
  longBreak: { label: 'Long Break', minutes: 15, icon: Coffee }
};

const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // C5 note for a pleasant chime
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    
    // Envelope for a soft bell sound
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};

const PomodoroWidget = ({ currentWordCount = 0, onSessionComplete }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [startWordCount, setStartWordCount] = useState(currentWordCount);
  
  const timerRef = useRef(null);

  const wordsWritten = Math.max(0, currentWordCount - startWordCount);

  const handleSessionEnd = useCallback(() => {
    playChime();
    
    const durationSeconds = MODES[mode].minutes * 60;
    if (onSessionComplete) {
      onSessionComplete(mode, durationSeconds, mode === 'focus' ? wordsWritten : 0);
    }

    // Auto-transition logic
    if (mode === 'focus') {
      setMode('shortBreak');
      setTimeLeft(MODES.shortBreak.minutes * 60);
    } else {
      setMode('focus');
      setTimeLeft(MODES.focus.minutes * 60);
      setStartWordCount(currentWordCount); // Reset word count for next focus session
    }
    
    // Expand widget if it was collapsed so user sees the transition
    setIsCollapsed(false);
    
    // Auto-start the next session
    setIsRunning(true);
  }, [mode, wordsWritten, currentWordCount, onSessionComplete]);

  // Global Keyboard Shortcut: Ctrl+Shift+P / Cmd+Shift+P to toggle collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionEnd();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, handleSessionEnd]);

  const toggleTimer = () => {
    if (!isRunning && timeLeft === MODES[mode].minutes * 60 && mode === 'focus') {
      // Just starting a fresh focus session
      setStartWordCount(currentWordCount);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
    if (mode === 'focus') {
      setStartWordCount(currentWordCount);
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
    if (newMode === 'focus') {
      setStartWordCount(currentWordCount);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ModeIcon = MODES[mode].icon;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      <motion.div 
        layout
        className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden min-w-[280px]"
      >
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => setIsCollapsed(false)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isRunning ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <ModeIcon className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mr-1 border border-border/50 rounded px-1 hidden sm:inline-block">
                  ⌘⇧P
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-background/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTimer();
                  }}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 flex flex-col gap-5 relative group"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide uppercase">Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border/50 rounded px-1 hidden sm:inline-block">
                    ⌘⇧P
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsCollapsed(true)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="flex bg-muted/30 p-1 rounded-lg gap-1">
                {Object.entries(MODES).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={cn(
                      "flex-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200",
                      mode === key 
                        ? "bg-background text-foreground shadow-sm border border-border/50" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center py-4">
                <span className={cn(
                  "font-serif text-6xl font-bold tabular-nums tracking-tighter transition-colors duration-500",
                  isRunning ? "text-primary text-glow-gold" : "text-foreground"
                )}>
                  {formatTime(timeLeft)}
                </span>
                
                {/* Word Count Tracker (Only in Focus mode) */}
                <div className="mt-3 h-6 flex items-center justify-center">
                  <AnimatePresence>
                    {mode === 'focus' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-sm font-medium text-muted-foreground flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        Words this session: <span className="text-foreground">{wordsWritten}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetTimer}
                  className="h-10 w-10 border-border/50 hover:bg-muted"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className={cn(
                    "h-12 w-24 shadow-lg transition-all duration-300",
                    isRunning 
                      ? "bg-muted text-foreground hover:bg-muted/80 shadow-none" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-1" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PomodoroWidget;