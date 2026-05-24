
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SetupPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form State
  const [circleName, setCircleName] = useState('');
  const [creatorName, setCreatorName] = useState(currentUser?.name || '');
  const [roundLength, setRoundLength] = useState(null);
  const [customWeeks, setCustomWeeks] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation
  const isCustomValid = roundLength === 'custom' ? (parseInt(customWeeks) >= 1 && parseInt(customWeeks) <= 52) : true;
  const isFormValid = 
    circleName.trim().length > 0 &&
    creatorName.trim().length > 0 &&
    roundLength !== null &&
    isCustomValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const finalLength = roundLength === 'custom' ? parseInt(customWeeks) : roundLength;
      
      // Generate invite details
      const inviteCode = crypto.randomUUID().slice(0, 8);
      
      // Build the circle creation payload with EXPLICIT currentWriterIndex field
      const circlePayload = {
        userId: currentUser.id,
        circleName: circleName,
        roundLength: finalLength,
        currentRound: 1,
        currentWriterIndex: 1, // 1-based: PocketBase rejects 0 on required number fields
        status: 'active',
        member_1_id: currentUser.id,
        member_1_name: creatorName,
        invite_code: inviteCode,
        writerNames: [] // Initialize empty array for JSON field just in case
      };

      // ===== COMPREHENSIVE LOGGING AS REQUESTED =====
      console.log('PAYLOAD BEFORE CREATE:', circlePayload);
      console.log('currentWriterIndex value:', circlePayload.currentWriterIndex, 'type:', typeof circlePayload.currentWriterIndex);
      
      console.log('--- INDIVIDUAL FIELD LOGS ---');
      Object.entries(circlePayload).forEach(([key, value]) => {
        console.log(`Field [${key}]: value =`, value, `| type =`, typeof value);
      });
      console.log('-----------------------------');
      
      // Create Circle with explicit $autoCancel: false
      const circle = await pb.collection('circles').create(circlePayload, { $autoCancel: false });
      
      console.log('CREATE RESPONSE:', circle);

      // Generate the full link using the record ID
      const inviteLink = `${window.location.origin}/join/${circle.id}`;
      
      await pb.collection('circles').update(circle.id, {
        invite_link: inviteLink
      }, { $autoCancel: false });

      // Create 3 placeholder Rounds immediately
      for (let i = 0; i < 3; i++) {
        const roundData = {
          circleId: circle.id,
          roundNumber: i + 1,
          wordCount: 0
        };
        
        if (i === 0) {
          roundData.status = 'in_progress';
          roundData.started_at = new Date().toISOString();
        }
        
        await pb.collection('rounds').create(roundData, { $autoCancel: false });
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('CREATE ERROR:', err);
      
      if (err.response) {
        console.error('PocketBase Response Details:', JSON.stringify(err.response.data, null, 2));
        
        if (err.response.data && typeof err.response.data === 'object') {
          const validationDetails = Object.entries(err.response.data)
            .map(([field, errorObj]) => {
              if (typeof errorObj === 'object' && errorObj.message) {
                return `${field}: ${errorObj.message}`;
              }
              return `${field}: ${JSON.stringify(errorObj)}`;
            })
            .join(' | ');
          
          if (validationDetails) {
            setError(`Validation Error: ${validationDetails}`);
            setIsLoading(false);
            return;
          }
        }
      }
      
      setError('The ritual failed. The spirits are restless. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Consecrate Your Circle | The Power of Three</title>
        <meta name="description" content="Set up your critique circle and step into the power of three." />
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] bg-background text-foreground selection:bg-primary/30 selection:text-primary py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary mb-4 sm:mb-6 text-balance">
              Consecrate Your Circle
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-serif-body text-foreground/80 italic text-balance">
              Three small rites before the Book of Shadows opens
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg max-w-2xl mx-auto text-center text-destructive font-serif-body text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-16 sm:space-y-20">
            
            {/* SECTION 1: Circle Name */}
            <section className="relative">
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <span className="text-primary font-serif-display uppercase tracking-widest text-xs sm:text-sm mb-2 sm:mb-3">
                  The First Rite
                </span>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3 sm:mb-4 text-balance">
                  Name your circle
                </h2>
                <p className="text-foreground/70 font-serif-body max-w-lg text-sm sm:text-base text-balance">
                  What shall this gathering be known as in the records of time?
                </p>
              </div>
              
              <div className="max-w-md mx-auto space-y-6">
                <Input
                  type="text"
                  placeholder="The Secret Circle"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px] sm:h-14 text-center text-lg sm:text-xl font-serif-body transition-all rounded-lg"
                  required
                />
              </div>
            </section>

            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="w-12 sm:w-16 h-px bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-primary"></div>
              <div className="w-12 sm:w-16 h-px bg-primary/40"></div>
            </div>

            {/* SECTION 2: Your Name */}
            <section>
              <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                <span className="text-primary font-serif-display uppercase tracking-widest text-xs sm:text-sm mb-2 sm:mb-3">
                  The Second Rite
                </span>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3 sm:mb-4 text-balance">
                  Your Identity
                </h2>
                <p className="text-foreground/70 font-serif-body max-w-lg text-sm sm:text-base text-balance">
                  You are the first to enter. The others will join when summoned.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px] sm:h-14 text-base sm:text-lg font-serif-body transition-all rounded-lg text-center"
                  required
                />
              </div>
            </section>

            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="w-12 sm:w-16 h-px bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-primary"></div>
              <div className="w-12 sm:w-16 h-px bg-primary/40"></div>
            </div>

            {/* SECTION 3: Round Length */}
            <section>
              <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                <span className="text-primary font-serif-display uppercase tracking-widest text-xs sm:text-sm mb-2 sm:mb-3">
                  The Third Rite
                </span>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3 sm:mb-4 text-balance">
                  The Length of a Round
                </h2>
                <p className="text-foreground/70 font-serif-body max-w-lg text-sm sm:text-base text-balance">
                  How long shall each phase last before the power shifts?
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { value: 2, label: '2 WEEKS' },
                    { value: 4, label: '4 WEEKS' },
                    { value: 6, label: '6 WEEKS' },
                    { value: 'custom', label: 'YOUR OWN' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRoundLength(option.value)}
                      className={`min-h-[44px] p-3 sm:p-4 rounded-xl border flex items-center justify-center font-display font-bold text-sm sm:text-base tracking-wider transition-all duration-300 ${
                        roundLength === option.value
                          ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,86,0.25)] scale-105'
                          : 'border-secondary/50 bg-card text-foreground/70 hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {roundLength === 'custom' && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 max-w-xs mx-auto mt-6">
                    <label className="block text-center text-xs sm:text-sm font-serif-display italic text-foreground/80 mb-2 sm:mb-3">
                      Enter number of weeks
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={customWeeks}
                      onChange={(e) => setCustomWeeks(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full bg-input text-gray-900 border-secondary focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px] sm:h-14 text-center text-lg sm:text-xl font-serif-body transition-all rounded-lg"
                      required
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Submit Action */}
            <div className="pt-8 sm:pt-12 text-center">
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="bg-primary text-primary-foreground px-8 sm:px-12 py-5 sm:py-7 rounded-lg font-display text-lg sm:text-xl font-bold hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(212,175,86,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:hover:-translate-y-0 disabled:hover:shadow-none w-full sm:w-auto min-h-[44px]"
              >
                {isLoading ? 'Summoning...' : 'Open the Book of Shadows'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default SetupPage;
