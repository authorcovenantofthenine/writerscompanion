import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import FeedbackDisplay from '@/components/FeedbackDisplay.jsx';
import { useNotifications } from '@/hooks/useNotifications.js';

export default function EditorTab({ round, isAssignedUser, writerName, addToast }) {
  const [feedback, setFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createNotification } = useNotifications();

  const [formData, setFormData] = useState({
    the_sharpening: '',
    structural_incantations: '',
    the_final_blessing: ''
  });

  const fields = [
    { key: 'the_sharpening', label: 'The Sharpening', description: 'Line-level craft: word choice, rhythm, clarity, prose that sang or stumbled.' },
    { key: 'structural_incantations', label: 'Structural Incantations', description: 'Structure, pacing, scene architecture. What needs reshaping at the larger level?' },
    { key: 'the_final_blessing', label: 'The Final Blessing', description: 'Your overall summation. Send this writer forward with clear purpose.' }
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!round?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const records = await pb.collection('editor_feedback').getList(1, 1, {
          filter: `round_id="${round.id}"`,
          $autoCancel: false
        });

        if (records.items.length > 0) {
          const fb = records.items[0];
          setFeedback(fb);
          setFormData({
            the_sharpening: fb.the_sharpening || '',
            structural_incantations: fb.structural_incantations || '',
            the_final_blessing: fb.the_final_blessing || ''
          });
        }
      } catch (err) {
        console.error('Failed to load editor feedback:', err);
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
    if (!formData.the_sharpening.trim() || !formData.structural_incantations.trim() || !formData.the_final_blessing.trim()) {
      toast.error('Please complete all sections before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        round_id: round.id,
        editor_id: pb.authStore.model.id,
        the_sharpening: formData.the_sharpening,
        structural_incantations: formData.structural_incantations,
        the_final_blessing: formData.the_final_blessing
      };

      let savedRecord;
      if (feedback?.id) {
        savedRecord = await pb.collection('editor_feedback').update(feedback.id, payload, { $autoCancel: false });
      } else {
        savedRecord = await pb.collection('editor_feedback').create(payload, { $autoCancel: false });
      }

      setFeedback(savedRecord);
      setIsEditing(false);

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
        addToast('Your craft has been inscribed.', 'success');
      } else {
        toast.success('Your craft has been inscribed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to inscribe your craft. The magic slipped.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-primary/70 animate-pulse font-serif-display">Unveiling the editor's craft...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-display text-[var(--feedback-gold)] italic">The Editor's Craft</h2>
        <p className="font-serif-body text-[var(--feedback-text)]/80 italic text-lg leading-relaxed">
          You hold the scalpel. Cut with care and intention. Your craft will shape what this work becomes.
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
              {round?.workTitle || 'Untitled Work'}
            </h4>
            <div className="font-serif-body text-[var(--feedback-text)] whitespace-pre-wrap leading-relaxed">
              {round?.workSubmission || 'The writer has not laid down their words yet.'}
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
          roleName="The Editor's Craft"
          feedback={feedback}
          fields={fields}
          canEdit={isAssignedUser}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-6">
            <h3 className="text-2xl font-display text-[var(--feedback-gold)] italic mb-2">Your Craft Notes</h3>
            <p className="font-serif-body text-[var(--feedback-text)]/70 italic">
              {isAssignedUser ? 'Bring your editorial eye to this work.' : "Awaiting the editor's craft..."}
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
                  placeholder="Share your craft notes..."
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
                {isSubmitting ? 'Inscribing...' : 'Submit Your Craft'}
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
