import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/context/AuthContext.jsx';
import TriquetraSymbol from '@/components/TriquetraSymbol.jsx';
import RoundCard from '@/components/RoundCard.jsx';
import RoleTab from '@/components/RoleTab.jsx';
import RitualBox from '@/components/RitualBox.jsx';
import StatBox from '@/components/StatBox.jsx';
import MemberAvatars from '@/components/MemberAvatars.jsx';
import InviteLink from '@/components/InviteLink.jsx';
import BetaReaderTab from '@/components/BetaReaderTab.jsx';
import EditorTab from '@/components/EditorTab.jsx';
import PassThePowerOverlay from '@/components/PassThePowerOverlay.jsx';
import CycleCompletionScreen from '@/components/CycleCompletionScreen.jsx';
import CountdownTimer from '@/components/CountdownTimer.jsx';
import NotificationBadge from '@/components/NotificationBadge.jsx';
import NotificationPanel from '@/components/NotificationPanel.jsx';
import ToastContainer from '@/components/ToastContainer.jsx';
import ArchivesSection from '@/components/ArchivesSection.jsx';
import LoadingScreen from '@/components/LoadingScreen.jsx';
import { useNotifications } from '@/hooks/useNotifications.js';
import { copyToClipboard, validateRoundSubmission, rotateRoles } from '@/lib/utils/dashboardUtils.js';

const CelticKnotDivider = () => (
  <div className="flex items-center justify-center my-8 opacity-80" aria-hidden="true">
    <svg width="200" height="24" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[150px] sm:max-w-[200px]">
      <path d="M100 2C90 2 85 12 75 12C65 12 60 2 50 2C40 2 35 12 25 12C15 12 10 2 0 2" stroke="#D4AF56" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M100 22C90 22 85 12 75 12C65 12 60 22 50 22C40 22 35 12 25 12C15 12 10 22 0 22" stroke="#D4AF56" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M100 2C110 2 115 12 125 12C135 12 140 2 150 2C160 2 165 12 175 12C185 12 190 2 200 2" stroke="#D4AF56" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M100 22C110 22 115 12 125 12C135 12 140 22 150 22C160 22 165 12 175 12C185 12 190 22 200 22" stroke="#D4AF56" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="12" r="6" stroke="#D4AF56" strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [circle, setCircle] = useState(null);
  const [members, setMembers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [activeTab, setActiveTab] = useState('writer');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isPassingPower, setIsPassingPower] = useState(false);
  const [showCycleCompletion, setShowCycleCompletion] = useState(false);
  const [passError, setPassError] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  
  // Notification State
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [customToasts, setCustomToasts] = useState([]);
  const { 
    notifications, 
    unreadCount, 
    fetchUnreadNotifications, 
    createNotification, 
    markAsRead, 
    markAllAsRead, 
    subscribeToNotifications 
  } = useNotifications();
  
  const [formData, setFormData] = useState({
    workTitle: '',
    workSubmission: '',
    callingQuestions: '',
    openingHope: '',
    closingLearned: '',
    winCelebration: ''
  });

  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setCustomToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setCustomToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const fetchCircleData = async () => {
      try {
        if (!currentUser) return;

        const circlesList = await pb.collection('circles').getList(1, 1, {
          sort: '-createdAt',
          $autoCancel: false 
        });

        if (circlesList.items.length === 0) {
          navigate('/setup');
          return;
        }

        const circleData = circlesList.items[0];
        setCircle(circleData);

        const memberArr = [
          { id: circleData.member_1_id, name: circleData.member_1_name, slot: 0 },
          { id: circleData.member_2_id, name: circleData.member_2_name, slot: 1 },
          { id: circleData.member_3_id, name: circleData.member_3_name, slot: 2 }
        ];
        
        const wIndex = circleData.currentWriterIndex || 0;
        const bIndex = (wIndex + 1) % 3;
        const eIndex = (wIndex + 2) % 3;

        memberArr[wIndex].role = 'Writer';
        memberArr[bIndex].role = 'Beta Reader';
        memberArr[eIndex].role = 'Editor';

        setMembers(memberArr);
        
        const roundsList = await pb.collection('rounds').getList(1, 100, {
          filter: `circleId="${circleData.id}"`,
          sort: 'roundNumber',
          $autoCancel: false 
        });

        setRounds(roundsList.items);
        
        const activeRound = roundsList.items.find(r => r.roundNumber === circleData.currentRound) || roundsList.items[0];
        setCurrentRound(activeRound);
        
        if (activeRound) {
          setFormData({
            workTitle: activeRound.workTitle || '',
            workSubmission: activeRound.workSubmission || '',
            callingQuestions: activeRound.callingQuestions || '',
            openingHope: activeRound.openingHope || '',
            closingLearned: activeRound.closingLearned || '',
            winCelebration: activeRound.winCelebration || ''
          });
        }

        // Fetch Archives Data
        const compRounds = roundsList.items.filter(r => r.status === 'completed');
        if (compRounds.length > 0) {
          const betaFeedbackList = await pb.collection('beta_reader_feedback').getFullList({
            filter: `round_id.circleId="${circleData.id}"`,
            $autoCancel: false
          });
          const editorFeedbackList = await pb.collection('editor_feedback').getFullList({
            filter: `round_id.circleId="${circleData.id}"`,
            $autoCancel: false
          });

          const enrichedCompletedRounds = compRounds.map(r => ({
            ...r,
            betaFeedback: betaFeedbackList.find(b => b.round_id === r.id) || null,
            editorFeedback: editorFeedbackList.find(e => e.round_id === r.id) || null
          }));
          
          setCompletedRounds(enrichedCompletedRounds);
        }

        // Initialize Notifications
        fetchUnreadNotifications(currentUser.id, circleData.id);
        
      } catch (error) {
        console.error("Error fetching circle data:", error);
        toast.error("Failed to read from the Book of Shadows.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCircleData();
  }, [currentUser, navigate, fetchUnreadNotifications]);

  // Setup Real-time Notification Subscription
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToNotifications(currentUser.id, (newNotif) => {
      addToast(newNotif.message, 'success');
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, subscribeToNotifications, addToast]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (passError) setPassError('');
  };

  const saveRoundData = async (isFinalSubmission = false) => {
    if (!currentRound) return;
    setIsSaving(true);
    
    try {
      const wordCount = formData.workSubmission.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      const updatedRound = await pb.collection('rounds').update(currentRound.id, {
        workTitle: formData.workTitle,
        workSubmission: formData.workSubmission,
        wordCount: wordCount,
        callingQuestions: formData.callingQuestions,
        openingHope: formData.openingHope,
        closingLearned: formData.closingLearned,
        winCelebration: formData.winCelebration
      }, { $autoCancel: false });

      setCurrentRound(updatedRound);
      setRounds(prevRounds => 
        prevRounds.map(r => r.id === updatedRound.id ? updatedRound : r)
      );

      if (isFinalSubmission) {
        // Notify Beta Reader and Editor
        const betaReader = members.find(m => m.role === 'Beta Reader');
        const editor = members.find(m => m.role === 'Editor');
        
        if (betaReader?.id) {
          await createNotification({
            circle_id: circle.id,
            round_id: currentRound.id,
            recipient_id: betaReader.id,
            sender_id: currentUser.id,
            type: 'work_submitted',
            message: 'The altar has been set. Your role awaits.'
          });
        }
        
        if (editor?.id) {
          await createNotification({
            circle_id: circle.id,
            round_id: currentRound.id,
            recipient_id: editor.id,
            sender_id: currentUser.id,
            type: 'work_submitted',
            message: 'The altar has been set. Your role awaits.'
          });
        }
        
        addToast('Your work has been submitted.', 'success');
      } else {
        toast.success("The words have been bound to the page.");
      }
      
      return updatedRound;
    } catch (err) {
      console.error(err);
      toast.error("The ink refused to settle. Save failed.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const passThePower = async () => {
    if (!validateRoundSubmission(formData)) {
      const errorMsg = 'The work must be complete before the power can pass. Submit your title and work.';
      setPassError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setIsUpdatingPass(true);
    setPassError('');

    try {
      await saveRoundData(true);

      const roundRecord = await pb.collection('rounds').getOne(currentRound.id, { $autoCancel: false });
      
      await pb.collection('rounds').update(roundRecord.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { $autoCancel: false });

      const nextRoundNumber = circle.currentRound + 1;
      const nextIndex = (circle.currentWriterIndex + 1) % 3;
      const isComplete = nextRoundNumber > 3;

      if (!isComplete) {
        const nextRound = rounds.find(r => r.roundNumber === nextRoundNumber);
        if (nextRound) {
          const currentRoles = {
            [members[circle.currentWriterIndex].id]: 'writer',
            [members[(circle.currentWriterIndex + 1) % 3].id]: 'beta_reader',
            [members[(circle.currentWriterIndex + 2) % 3].id]: 'editor'
          };
          
          const newRoles = rotateRoles(currentRoles);
          
          let newWriterName, newBetaName, newEditorName;
          members.forEach(m => {
            if (newRoles[m.id] === 'writer') newWriterName = m.name;
            if (newRoles[m.id] === 'beta_reader') newBetaName = m.name;
            if (newRoles[m.id] === 'editor') newEditorName = m.name;
          });

          await pb.collection('rounds').update(nextRound.id, {
            status: 'in_progress',
            started_at: new Date().toISOString(),
            current_writer: newWriterName,
            current_beta_reader: newBetaName,
            current_editor: newEditorName
          }, { $autoCancel: false });
        }

        await pb.collection('circles').update(circle.id, {
          currentRound: nextRoundNumber,
          currentWriterIndex: nextIndex,
          status: 'active'
        }, { $autoCancel: false });
      } else {
        await pb.collection('circles').update(circle.id, {
          currentRound: 3,
          status: 'completed',
          completed_at: new Date().toISOString()
        }, { $autoCancel: false });
      }

      setIsPassingPower(true);
      
    } catch (err) {
      console.error(err);
      const errorMsg = "Failed to pass the power. The circle resists.";
      setPassError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleAnimationComplete = () => {
    setIsPassingPower(false);
    const isComplete = circle.currentRound + 1 > 3;
    
    if (isComplete) {
      setShowCycleCompletion(true);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleBeginNewCycle = async () => {
    try {
      const newCircle = await pb.collection('circles').create({
        circleName: `${circle.circleName} - Cycle 2`,
        roundLength: circle.roundLength,
        currentRound: 1,
        currentWriterIndex: 0,
        status: 'active',
        userId: currentUser.id,
        member_1_id: circle.member_1_id,
        member_1_name: circle.member_1_name,
        member_2_id: circle.member_2_id,
        member_2_name: circle.member_2_name,
        member_3_id: circle.member_3_id,
        member_3_name: circle.member_3_name
      }, { $autoCancel: false });

      for (let i = 1; i <= 3; i++) {
        await pb.collection('rounds').create({
          circleId: newCircle.id,
          roundNumber: i,
          status: i === 1 ? 'in_progress' : 'pending',
          started_at: i === 1 ? new Date().toISOString() : null
        }, { $autoCancel: false });
      }

      toast.success('New cycle begun!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error('Failed to begin new cycle.');
    }
  };

  const handleDissolveCircle = async () => {
    try {
      await pb.collection('circles').update(circle.id, {
        status: 'completed'
      }, { $autoCancel: false });
      
      toast.success('The circle has been dissolved. Thank you for the magic you created together.');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to dissolve circle.');
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(formData);
    if (success) toast.success("Round data copied to clipboard.");
  };

  const isCircleFull = members.every(m => m.name !== null && m.name !== '');

  const currentWriter = members.find(m => m.role === 'Writer') || {};
  const currentBetaReader = members.find(m => m.role === 'Beta Reader') || {};
  const currentEditor = members.find(m => m.role === 'Editor') || {};

  const isCurrentWriterUser = currentUser?.id === currentWriter.id;
  const isCurrentBetaReaderUser = currentUser?.id === currentBetaReader.id;
  const isCurrentEditorUser = currentUser?.id === currentEditor.id;

  const timerData = useMemo(() => {
    if (!currentRound || !circle || !currentRound.started_at) return null;
    const roundLengthDays = (circle.roundLength || 2) * 7;
    const startedAt = new Date(currentRound.started_at);
    const deadline = new Date(startedAt.getTime() + roundLengthDays * 24 * 60 * 60 * 1000);
    
    return {
      started_at: currentRound.started_at,
      round_length: roundLengthDays,
      deadline: deadline.toISOString()
    };
  }, [currentRound, circle]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const wordCount = formData.workSubmission.trim().split(/\s+/).filter(w => w.length > 0).length;

  const roundWithWriter = {
    ...currentRound,
    ...formData,
    writerId: currentWriter.id,
    circleId: circle?.id
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | The Power of Three</title>
      </Helmet>

      <ToastContainer toasts={customToasts} removeToast={removeToast} />

      <PassThePowerOverlay 
        isVisible={isPassingPower} 
        onAnimationComplete={handleAnimationComplete} 
      />

      {showCycleCompletion && (
        <CycleCompletionScreen 
          circleName={circle?.circleName}
          members={members}
          onBeginNewCycle={handleBeginNewCycle}
          onDissolveCircle={handleDissolveCircle}
        />
      )}

      <div className="min-h-[calc(100vh-80px)] text-foreground pb-24">
        {/* DASHBOARD SUB-HEADER */}
        <div className="border-b border-secondary/30 bg-card/20 py-4 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
              <div>
                <h2 className="font-display text-lg sm:text-xl text-primary mb-1 text-balance">
                  {circle?.circleName || 'The Secret Circle'}
                </h2>
                <p className="font-serif-display text-xs sm:text-sm text-foreground/80 uppercase tracking-widest text-balance">
                  Round {circle?.currentRound || 1} 
                  {circle?.status === 'completed' && ' (Completed)'}
                </p>
              </div>
              
              {circle?.status === 'active' && timerData && (
                <div className="sm:ml-2 sm:pl-6 border-t sm:border-t-0 sm:border-l border-secondary/30 pt-2 sm:pt-0">
                  <CountdownTimer currentRound={timerData} />
                </div>
              )}
            </div>
            
            <MemberAvatars 
              members={members} 
              currentWriterIndex={circle?.currentWriterIndex} 
            />
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-24">
          
          {/* INVITATION SECTION */}
          {!isCircleFull && circle?.invite_link && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <InviteLink circleId={circle.id} inviteUrl={circle.invite_link} />
            </section>
          )}

          {/* SECTION 1 - THE CYCLE */}
          <section>
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-2 sm:mb-3">The Cycle</h2>
              <p className="text-base sm:text-lg font-serif-body italic text-foreground/70">
                Three rounds. Three looks. The power passes, the circle holds.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rounds.map((round, idx) => {
                const roundWriter = members[idx];
                const isCurrent = round.roundNumber === circle?.currentRound && circle?.status === 'active';
                const displayName = roundWriter?.name || 'Awaiting';

                return (
                  <div key={round.id} className={`border rounded-xl p-4 sm:p-6 w-full flex flex-col items-center justify-center transition-all duration-300 ${
                    isCurrent 
                      ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,86,0.1)]' 
                      : 'border-secondary/50 bg-card/30'
                  }`}>
                    <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-foreground/60 mb-2">
                      Round {round.roundNumber}
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-serif-display text-center ${isCurrent ? 'text-primary italic' : 'text-foreground/80'}`}>
                      {displayName}
                    </h3>
                    <span className={`text-[10px] sm:text-xs mt-3 sm:mt-4 uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
                      {isCurrent ? 'In the Circle' : 'Awaiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2 - THE BOOK OF SHADOWS */}
          <section className={!isCircleFull ? "opacity-50 pointer-events-none select-none transition-opacity" : ""}>
            <CelticKnotDivider />
            
            <div className="text-center mb-6 relative px-4">
              <div className="inline-flex items-center justify-center gap-2 sm:gap-4 relative">
                <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-2 sm:mb-3">The Book of Shadows</h2>
                <div className="absolute -right-8 sm:-right-10 top-0 sm:top-1">
                  <NotificationBadge 
                    unreadCount={unreadCount} 
                    onClick={() => {
                      setShowNotifPanel(!showNotifPanel);
                      if (!showNotifPanel && unreadCount > 0) {
                        markAllAsRead(currentUser.id, circle.id);
                      }
                    }} 
                  />
                  {showNotifPanel && (
                    <NotificationPanel 
                      notifications={notifications} 
                      onMarkAsRead={markAsRead}
                      onClose={() => setShowNotifPanel(false)}
                    />
                  )}
                </div>
              </div>
              <p className="text-base sm:text-lg font-serif-body italic text-foreground/70">
                {isCircleFull 
                  ? `This round belongs to ${currentWriter.name}. The other two gather around the work.`
                  : "The book remains sealed until the circle is complete."}
              </p>
            </div>

            <CelticKnotDivider />

            <div className="bg-card/20 border border-secondary/30 rounded-2xl overflow-hidden shadow-lg shadow-black/20 mt-8 sm:mt-10">
              <div className="flex border-b border-secondary/30 bg-card/40 overflow-x-auto scrollbar-hide flex-nowrap w-full">
                <RoleTab 
                  role="The Writer" 
                  icon="✍" 
                  isActive={activeTab === 'writer'} 
                  onClick={() => setActiveTab('writer')} 
                />
                <RoleTab 
                  role="The Beta Reader" 
                  icon="✦" 
                  isActive={activeTab === 'beta'} 
                  onClick={() => setActiveTab('beta')} 
                />
                <RoleTab 
                  role="The Editor" 
                  icon="✦" 
                  isActive={activeTab === 'editor'} 
                  onClick={() => setActiveTab('editor')} 
                />
              </div>

              <div className="p-4 sm:p-8">
                {/* SUBSECTION 2A - THE WORK ON THE ALTAR (WRITER TAB) */}
                {activeTab === 'writer' && (
                  <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-display text-primary italic mb-2">The Work on the Altar</h3>
                          <p className="text-sm sm:text-base font-serif-body italic text-foreground/70 mb-2">
                            {isCurrentWriterUser ? "Lay down the words. Only what is placed here can be read." : `${currentWriter.name}'s laid words.`}
                          </p>
                        </div>
                        {isCurrentWriterUser && (
                          <button 
                            onClick={() => saveRoundData(false)} 
                            disabled={isSaving || circle?.status === 'completed' || !isCircleFull}
                            className="button-shimmer text-sm border border-primary/50 text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors disabled:opacity-50 min-h-[44px] sm:self-start w-full sm:w-auto"
                          >
                            {isSaving ? 'Binding...' : 'Save Draft'}
                          </button>
                        )}
                      </div>
                      
                      <input
                        type="text"
                        value={formData.workTitle}
                        onChange={(e) => handleFormChange('workTitle', e.target.value)}
                        disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                        placeholder="Title of the piece — chapter, scene, or section"
                        className="w-full bg-transparent border-b border-secondary/50 text-foreground placeholder:text-foreground/30 py-3 text-lg sm:text-xl font-serif-body focus:border-primary outline-none transition-all disabled:opacity-70 min-h-[44px]"
                      />
                      
                      <textarea
                        value={formData.workSubmission}
                        onChange={(e) => handleFormChange('workSubmission', e.target.value)}
                        disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                        placeholder="Your words go here. Or a link to where they dwell (Google Doc, QuillForge, etc.)"
                        className="w-full min-h-[250px] sm:min-h-[300px] bg-card/30 border border-secondary/50 rounded-xl p-4 sm:p-6 text-sm sm:text-base text-foreground font-serif-body placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y disabled:opacity-70"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <StatBox label="Words Invoked" value={wordCount} />
                        <StatBox label="Round Length" value={`${circle?.roundLength || 2} wks`} />
                        <StatBox label="This Round" value={circle?.currentRound || 1} />
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-display text-primary italic mb-2">The Calling — What Do You Want to Know?</h3>
                        <p className="text-sm sm:text-base font-serif-body italic text-foreground/70 mb-4 sm:mb-6">Specify questions summoning specific answers.</p>
                      </div>
                      <textarea
                        value={formData.callingQuestions}
                        onChange={(e) => handleFormChange('callingQuestions', e.target.value)}
                        disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                        placeholder="e.g., Is the pacing in the middle section too slow?"
                        className="w-full min-h-[120px] sm:min-h-[150px] bg-card/30 border border-secondary/50 rounded-xl p-4 sm:p-6 text-sm sm:text-base text-foreground font-serif-body placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-display text-foreground mb-2">The Rituals</h3>
                        <p className="text-sm sm:text-base font-serif-body italic text-foreground/70 mb-6 sm:mb-8">Small practices that keep the circle strong across the rounds.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <RitualBox 
                          title="The Opening · The Hope"
                          description="What do you hope to achieve this round?"
                          value={formData.openingHope}
                          onChange={(e) => handleFormChange('openingHope', e.target.value)}
                          disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                          placeholder="I hope to finally nail this scene..."
                        />
                        <RitualBox 
                          title="The Closing · What We Learned"
                          description="What insight did this round bring?"
                          value={formData.closingLearned}
                          onChange={(e) => handleFormChange('closingLearned', e.target.value)}
                          disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                          placeholder="I learned that my pacing was off..."
                        />
                        <RitualBox 
                          title="The Win · To Be Sung in the Guild"
                          description="What victory should be celebrated?"
                          value={formData.winCelebration}
                          onChange={(e) => handleFormChange('winCelebration', e.target.value)}
                          disabled={circle?.status === 'completed' || !isCircleFull || !isCurrentWriterUser}
                          placeholder="I wrote 5,000 words this week!"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'beta' && (
                  <BetaReaderTab 
                    round={roundWithWriter} 
                    isAssignedUser={isCurrentBetaReaderUser && circle?.status === 'active'}
                    writerName={currentWriter.name}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'editor' && (
                  <EditorTab 
                    round={roundWithWriter} 
                    isAssignedUser={isCurrentEditorUser && circle?.status === 'active'}
                    writerName={currentWriter.name}
                    addToast={addToast}
                  />
                )}

              </div>
            </div>
          </section>

          {/* SECTION 3 - SHARE & PASS THE POWER */}
          {circle?.status === 'active' && isCircleFull && isCurrentWriterUser && activeTab === 'writer' && (
            <section className="text-center space-y-6 sm:space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-2 sm:mb-3">Share & Pass the Power</h2>
                <p className="text-base sm:text-lg font-serif-body italic text-foreground/70 max-w-2xl mx-auto">
                  Carry this round's work back to the Guild. When all three of you are ready, the power passes to the next Writer.
                </p>
              </div>
              
              {passError && (
                <div className="text-destructive bg-destructive/10 border border-destructive/20 py-3 px-4 sm:px-6 rounded-lg max-w-2xl mx-auto font-serif-body text-sm">
                  {passError}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button 
                  onClick={handleCopy}
                  className="button-shimmer bg-secondary text-secondary-foreground px-6 sm:px-8 py-3 min-h-[44px] rounded-lg font-display text-base sm:text-lg hover:bg-secondary/90 transition-all shadow-md w-full sm:w-auto"
                >
                  Copy This Round
                </button>
                <button 
                  onClick={passThePower}
                  disabled={isUpdatingPass}
                  className="button-shimmer bg-primary text-primary-foreground px-6 sm:px-10 py-3 min-h-[44px] rounded-lg font-display text-base sm:text-lg font-bold hover:bg-primary/90 hover:-translate-y-1 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(212,175,86,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isUpdatingPass ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Pass the Power →'
                  )}
                </button>
              </div>
            </section>
          )}

          {/* SECTION 4 - THE ARCHIVES */}
          {completedRounds.length > 0 && (
            <ArchivesSection completedRounds={completedRounds} circleData={circle} />
          )}

        </main>
      </div>
    </>
  );
}