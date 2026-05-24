import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import FeedbackDisplay from '@/components/FeedbackDisplay.jsx';
import { useNotifications } from '@/hooks/useNotifications.js';

export default function BetaReaderTab({ round, isAssignedUser, writerName, addToast }) {
  const [feedback, setFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    what_resonated: '',
    where_spell_faltered: '',
    visions_for_writer: ''
  });

  const fields = [
    { key: 'what_resonated', label: 'What Resonated', description: 'What worked? What drew you in? What moments sang?' },
    { key: 'where_spell_faltered', label: 'Where the Spell Faltered', description: 'Where did the work lose you? What confused or disconnected you?' },
    { key: 'visions_for_writer', label: 'Visions for the Writer', description: 'What do you see as possibilities? What would strengthen this work?' }
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!round?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const records = await pb.collection('beta_reader_feedback').getList(1, 1, {
          filter: `round_id="${round.id}"`,
          $autoCancel: false
        });
        
        if (records.items.length > 0) {
          const fb = records.items[0];
          setFeedback(fb);
          setFormData({
            what_resonated: fb.what_resonated || '',
            where_spell_faltered: fb.where_spell_faltered || '',
            visions_for_writer: fb.visions_for_writer || ''
          });
        }
      } catch (err) {
        console.error("Failed to load feedback:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [round?.id]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.what_resonated.trim() || !formData.where_spell_faltered.trim() || !formData.visions_for_writer.trim()) {
      toast.error("Please complete all reflections before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        round_id: round.id,
        beta_reader_id: pb.authStore.model.id,
        what_resonated: formData.what_resonated,
        where_spell_faltered: formData.where_spell_faltered,
        visions_for_writer: formData.visions_for_writer
      };

      let savedRecord;
      if (feedback?.id) {
        savedRecord = await pb.collection('beta_reader_feedback').update(feedback.id, payload, { $autoCancel: false });
      } else {
        savedRecord = await pb.collection('beta_reader_feedback').create(payload, { $autoCancel: false });
      }

      setFeedback(savedRecord);
      setIsEditing(false);
      
      // Notify the writer
      if (round.circleId && round.writerId) {
        await createNotification({
          circle_id: round.circleId,
          round_id: round.id,
          recipient_id: round.writerId,
          sender_id: pb.authStore.model.id,
          type: 'feedback_submitted',
          message: 'Your coven has spoken. Read their wisdom.'
        });
      }

      if (addToast) {
        addToast('Your reflection has been recorded.', 'success');
      } else {
        toast.success("Your reflection has been recorded.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to record your reflection. The magic slipped.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-primary/70 animate-pulse font-serif-display">Unveiling the reflections...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-display text-[var(--feedback-gold)] italic">The Beta Reader's Vigil</h2>
        <p className="font-serif-body text-[var(--feedback-text)]/80 italic text-lg leading-relaxed">
          You hold the writer's work in your hands. Read with care. Your words will shape what comes next.
        </p>
      </div>

      {/* READ ONLY CONTENT FROM WRITER */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-display text-[var(--feedback-text)] opacity-80 uppercase tracking-widest text-sm">
            The Work Before You ({writerName})
          </h3>
          <div className="feedback-container max-h-[500px] overflow-y-auto">
            <h4 className="text-2xl font-display text-[var(--feedback-gold)] mb-6">
              {round?.workTitle || "Untitled Work"}
            </h4>
            <div className="font-serif-body text-[var(--feedback-text)] whitespace-pre-wrap leading-relaxed">
              {round?.workSubmission || "The writer has not laid down their words yet."}
            </div>
          </div>
        </div>

        {round?.callingQuestions && (
          <div className="space-y-4">
            <h3 className="text-xl font-display text-[var(--feedback-text)] opacity-80 uppercase tracking-widest text-sm">
              The Writer's Calling
            </h3>
            <div className="feedback-container">
              <div className="font-serif-body text-[var(--feedback-text)] whitespace-pre-wrap italic">
                {round.callingQuestions}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="gold-divider">
        <div className="gold-divider-line"></div>
        <div className="gold-divider-diamond"></div>
        <div className="gold-divider-line"></div>
      </div>

      {/* FEEDBACK FORM / DISPLAY */}
      {feedback && !isEditing ? (
        <FeedbackDisplay 
          roleName="Beta Reader's Reflection" 
          feedback={feedback} 
          fields={fields} 
          canEdit={isAssignedUser} 
          onEdit={() => setIsEditing(true)} 
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-6">
            <h3 className="text-2xl font-display text-[var(--feedback-gold)] italic mb-2">Your Reflections</h3>
            <p className="font-serif-body text-[var(--feedback-text)]/70 italic">
              {isAssignedUser ? "Offer your insights to the writer." : "Awaiting the beta reader's vigil..."}
            </p>
          </div>

          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="block text-lg font-display text-[var(--feedback-gold)]">
                  {field.label}
                </label>
                <p className="font-serif-body text-sm text-[var(--feedback-text)]/60 italic mb-2">
                  {field.description}
                </p>
                <textarea
                  required
                  disabled={!isAssignedUser || isSubmitting}
                  value={formData[field.key]}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  className="feedback-textarea min-h-[150px]"
                  placeholder="Share your thoughts..."
                />
              </div>
            ))}
          </div>

          {isAssignedUser && (
            <div className="pt-4 text-center sm:text-left">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="feedback-submit-btn"
              >
                {isSubmitting ? 'Recording...' : 'Submit Your Reflection'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="ml-4 text-sm font-serif-display italic text-[var(--feedback-text)]/70 hover:text-[var(--feedback-text)] transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}