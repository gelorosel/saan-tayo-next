"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";
import { getActivityOptions, Vibe, Environment } from "@/src/data/activities";
import { toPreference } from "@/lib/preference";
import { scoreDestinations } from "@/lib/score";
import { personalityScore, personalityPreferredActivities } from "@/lib/personalityScore";
import { destinations } from "@/src/data/destinations";
import { personalityById, personalities } from "@/src/data/personalities";
import type { PersonalityId } from "@/src/types/personality";
import { Activity } from "@/src/types/preference";
import { Option } from "@/src/types/question";

import MiniCard from "@/components/MiniCard";
import { PersonalityResultCard } from "@/components/PersonalityResultCard";
import { DevelopmentModal } from "@/components/DevelopmentModal";
import { ErrorModal } from "@/components/ErrorModal";
import { PersonalitiesSidebar } from "@/components/PersonalitiesSidebar";
import { PersonalitiesSidebarProvider } from "@/contexts/PersonalitiesSidebarContext";
import { DebugPanel } from "@/components/DebugPanel";
import { getRemainingRequests, MAX_DESCRIPTION_REQUESTS } from "@/lib/rateLimit";
import { RateLimitModal } from "@/components/RateLimitModal";
// import { resetRateLimit, triggerRateLimit } from '@/lib/rateLimit';
// triggerRateLimit();
// resetRateLimit();

const FAST_MODE_KEY = "fastMode";
const ANSWERS_KEY = "quizAnswers";
const PICK_KEY = "destinationPick";

let DEBUG_MODE = false;
// DEBUG_MODE = true; // Comment in to enable debug mode

const SERVICE_UNAVAILABLE_MESSAGE = "Our services are temporarily down, please try again at another time.";

export default function Home() {
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    DEBUG_MODE ? { name: "Gelo" } : {}
  );
  const [fastMode, setFastMode] = useState(DEBUG_MODE); // Enable fast mode in debug
  const [hasShownDestination, setHasShownDestination] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const [debugPersonality, setDebugPersonality] = useState<PersonalityId | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [remainingRequests, setRemainingRequests] = useState(MAX_DESCRIPTION_REQUESTS);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);

  const canGoBack = step > 0 && !isKillSwitchActive;
  const preferences = useMemo(() => toPreference(answers), [answers]);
  const personalityResult = useMemo(() => {
    // In debug mode, use debugPersonality if set
    if (DEBUG_MODE && debugPersonality) {
      return {
        primary: debugPersonality,
        scores: {} as any,
        preferredActivities: personalityPreferredActivities[debugPersonality]
      };
    }
    return personalityScore(answers);
  }, [answers, debugPersonality]);

  const personalityProfile = useMemo(() => {
    // In debug mode, use debugPersonality if set
    if (DEBUG_MODE && debugPersonality) {
      return personalityById.get(debugPersonality) ?? null;
    }
    if (!personalityResult) return null;
    return personalityById.get(personalityResult.primary) ?? null;
  }, [personalityResult, debugPersonality]);
  const preferredActivities = useMemo(() => {
    const items: Activity[] = [];
    if (preferences.activity?.length) items.push(...preferences.activity);
    if (personalityResult?.preferredActivities) {
      items.push(...personalityResult.preferredActivities);
    }
    return Array.from(new Set(items));
  }, [preferences.activity, personalityResult?.preferredActivities]);
  const primaryActivity = useMemo(() => preferredActivities[0], [preferredActivities]);

  const scoredDestinations = useMemo(() => {
    const applyPersonalityFilter = answers.traveler_new !== "yes";
    return scoreDestinations(
      preferences,
      destinations,
      personalityResult?.preferredActivities ?? [],
      applyPersonalityFilter,
      personalityResult?.primary
    );
  }, [preferences, personalityResult?.preferredActivities, personalityResult?.primary, answers.traveler_new]);
  const [finalDestinations, setFinalDestinations] = useState<typeof scoredDestinations>([]);

  useEffect(() => {
    setFinalDestinations(scoredDestinations);
    setPick(0);
  }, [scoredDestinations]);

  // keep pick in range if list size changes
  useEffect(() => {
    if (pick >= finalDestinations.length) {
      setPick(Math.max(0, finalDestinations.length - 1));
    }
  }, [pick, finalDestinations.length]);

  // Check kill switch on mount and update rate limit counter
  useEffect(() => {
    const killSwitch = process.env.NEXT_PUBLIC_KILL_SWITCH === 'true';
    setIsKillSwitchActive(killSwitch);
    if (killSwitch) {
      setShowErrorModal(true);
    }

    // Update remaining requests counter
    setRemainingRequests(getRemainingRequests());

    // Update counter periodically (every 30 seconds) to catch changes
    const interval = setInterval(() => {
      setRemainingRequests(getRemainingRequests());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter questions based on debug mode
  const filteredQuestions = useMemo(() => {
    if (!DEBUG_MODE) return questions;
    // Skip personality questions in debug mode
    const personalityQuestionIds = [
      "traveler_morning",
      "traveler_afternoon",
      "traveler_spend",
      "traveler_suitcase",
      "traveler_new",
      "traveler_plans"
    ];
    return questions.filter(q => !personalityQuestionIds.includes(q.id));
  }, []);

  // Load saved state on mount
  useEffect(() => {
    // Don't load saved state if kill switch is active
    if (isKillSwitchActive) return;

    const savedFastMode = localStorage.getItem(FAST_MODE_KEY);
    if (savedFastMode !== null) {
      setFastMode(savedFastMode === "true");
    }

    const savedAnswers = localStorage.getItem(ANSWERS_KEY);
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        // Set step to show results if quiz was completed
        setStep(filteredQuestions.length);
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    const savedPick = localStorage.getItem(PICK_KEY);
    if (savedPick !== null) {
      const pickNum = parseInt(savedPick, 10);
      if (!isNaN(pickNum)) {
        setPick(pickNum);
      }
    }
  }, [isKillSwitchActive]);

  const baseCurrent = filteredQuestions[step];

  const toggleFastMode = useCallback((forceValue?: boolean) => {
    const newValue = forceValue !== undefined ? forceValue : !fastMode;
    setFastMode(newValue);
    localStorage.setItem(FAST_MODE_KEY, String(newValue));
    window.dispatchEvent(new CustomEvent("fastModeChanged", { detail: newValue }));
  }, [fastMode]);

  const current = useMemo(() => {
    if (!baseCurrent) return null;

    if (baseCurrent.id === "activity") {
      if (baseCurrent.options && baseCurrent.options.length > 0) {
        return baseCurrent;
      }

      const environment = (answers.environment as Environment) || "beach";
      const vibe = answers.vibe as Vibe | undefined;
      const isAnyEnvironment = answers.environment === "any";

      return {
        ...baseCurrent,
        options: getActivityOptions(environment, vibe),
        question: isAnyEnvironment ? "Pick your top 3 activities" : baseCurrent.question,
        multiSelect: isAnyEnvironment,
        minSelections: isAnyEnvironment ? 3 : undefined,
        maxSelections: isAnyEnvironment ? 3 : undefined,
      };
    }

    return baseCurrent;
  }, [baseCurrent, answers.environment, answers.vibe]);

  // Save answers to localStorage whenever they change (and quiz is complete)
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !current) {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    }
  }, [answers, current]);

  // Save pick to localStorage whenever it changes (and results are showing)
  useEffect(() => {
    if (!current && finalDestinations.length > 0) {
      localStorage.setItem(PICK_KEY, String(pick));
    }
  }, [pick, current, finalDestinations.length]);

  // Mark that we've shown a destination for the first time
  useEffect(() => {
    if (!baseCurrent && finalDestinations.length > 0 && !hasShownDestination) {
      setHasShownDestination(true);
    }
  }, [baseCurrent, finalDestinations.length, hasShownDestination, preferences]);

  // Get related destinations: region destinations first, then rest of finalDestinations
  const relatedDestinations = useMemo(() => {
    if (current || finalDestinations.length === 0) {
      return [];
    }

    const currentDestination = finalDestinations[pick];
    const currentDestinationId = currentDestination.id;
    const currentRegion = currentDestination.location?.region;

    // Get region destinations (from all destinations, filtered by region)
    let regionDestinations: typeof finalDestinations = [];
    if (currentRegion) {
      const regionDests = destinations.filter(
        d => d.location?.region === currentRegion && d.id !== currentDestinationId
      );

      if (regionDests.length > 0) {
        const scoredRegionDests = scoreDestinations(
          preferences,
          regionDests,
          personalityResult?.preferredActivities ?? [],
          true,
          personalityResult?.primary
        );
        regionDestinations = scoredRegionDests.slice(0, 5);
      }
    }

    // Get the rest of finalDestinations (excluding current and region destinations)
    const regionDestinationIds = new Set(regionDestinations.map(d => d.id));
    const restOfFinalDestinations = finalDestinations.filter(
      d => d.id !== currentDestinationId && !regionDestinationIds.has(d.id)
    );

    // Combine: region destinations first, then rest of finalDestinations, limit to 20
    return [...regionDestinations, ...restOfFinalDestinations].slice(0, 20);
  }, [current, finalDestinations, pick, preferences, personalityResult?.preferredActivities]);

  const handleMiniCardClick = useCallback((destinationId: string) => {
    const destinationIndex = finalDestinations.findIndex((d) => d.id === destinationId);

    if (destinationIndex !== -1) {
      setPick(destinationIndex);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Scroll the horizontal container back to the left
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  }, [finalDestinations]);

  const goNext = useCallback((questionId: string, chosenValue: string) => {
    // Prevent navigation if kill switch is active
    if (isKillSwitchActive) {
      setShowErrorModal(true);
      return;
    }

    setAnswers((prev) => {
      const next = { ...prev, [questionId]: chosenValue };

      if (questionId === "environment") {
        delete next.activity; // changing environment invalidates activity
      }

      return next;
    });

    setStep((prev) => prev + 1);
  }, [isKillSwitchActive]);

  const handleSelect = useCallback((value: string) => {
    if (!current) return;
    goNext(current.id, value);
  }, [current, goNext]);

  const handleBack = useCallback(() => {
    setAnswers((prev) => {
      const next = { ...prev };

      const currentQuestion = questions[step];

      if (!currentQuestion) return next;

      // If we're backing out of the activity step, clear activity
      if (currentQuestion.id === "activity") {
        delete next.activity;
      }

      return next;
    });

    setStep((prev) => Math.max(0, prev - 1));
  }, [step]);

  const handleStartOver = useCallback(() => {
    setStep(0);
    setPick(0);
    setAnswers({});
    setHasShownDestination(false);
    // Clear localStorage
    localStorage.removeItem(ANSWERS_KEY);
    localStorage.removeItem(PICK_KEY);
  }, []);

  const handleBeenHere = useCallback(() => {
    setIsLoadingDestination(true);
    setPick((prev) => Math.min(prev + 1, finalDestinations.length - 1));
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [finalDestinations.length]);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setIsLoadingDestination(isLoading);
  }, []);

  return (
    <PersonalitiesSidebarProvider>
      {/* {!isKillSwitchActive && <DevelopmentModal />} */}
      <PersonalitiesSidebar />

      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="max-w-xl w-full mx-auto">
            <h1 className="text-styled text-4xl mt-6">Saan Tayo Next?</h1>
            <h2 className="text-xl font-semibold mb-4">Find your next destination</h2>
            {isKillSwitchActive && <p className="text-sm text-muted-foreground mb-4">⚠️ {SERVICE_UNAVAILABLE_MESSAGE}</p>}

            {/* Debug Controls */}
            {DEBUG_MODE && (
              <DebugPanel
                answers={answers}
                setAnswers={setAnswers}
                debugPersonality={debugPersonality}
                setDebugPersonality={setDebugPersonality}
                onShowResults={() => setStep(filteredQuestions.length)}
              />
            )}
            {current ? (
              DEBUG_MODE ? null : (
                <QuestionCard
                  current={current}
                  options={current.options as Option[]}
                  onSelect={handleSelect}
                  onBack={handleBack}
                  canGoBack={canGoBack}
                  disabled={isKillSwitchActive}
                />
              )
            ) :
              finalDestinations.length ? (
                <div className="flex flex-col lg:flex-row items-start">
                  {personalityProfile && (
                    <PersonalityResultCard
                      personality={personalityProfile}
                      answers={answers}
                      destination={finalDestinations[pick]}
                      preferredActivity={primaryActivity}
                      fastMode={fastMode}
                      onBeenHere={handleBeenHere}
                      onLoadingChange={handleLoadingChange}
                      onImageError={() => setShowErrorModal(true)}
                      onRateLimitReached={() => setShowRateLimitModal(true)}
                      destinationName={DEBUG_MODE ? `${finalDestinations[pick].name} (${finalDestinations[pick].score})` : finalDestinations[pick].name}
                      currentIndex={pick}
                      totalCount={finalDestinations.length}
                    />
                  )}
                </div>
              ) : (
                <p>No places matched this moment.</p>
              )
            }

            {(canGoBack || DEBUG_MODE) &&
              <div className="my-3 flex flex-row justify-between gap-4">
                {canGoBack && (
                  <button
                    className="underline text-sm cursor-pointer"
                    onClick={handleBack}
                  >
                    {current ? "Back" : "Back to questions"}
                  </button>
                )}
                <button
                  className="underline text-sm cursor-pointer"
                  onClick={handleStartOver}
                >
                  Start over
                </button>
              </div>
            }
            {hasShownDestination && (
              <>
                <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fastMode}
                    onChange={() => toggleFastMode()}
                    className="cursor-pointer"
                  />
                  <span>Fast mode (skip loading images and description)</span>
                </label>
              </>
            )}
          </div>

          {/* More destinations section */}
          {relatedDestinations.length > 0 && (
            <div className="w-full mt-10">
              <h3 className="text-base font-semibold mb-3">
                You might also like:
              </h3>
              <div className="relative -mx-6 px-6">
                {/* Scrollable container */}
                <div ref={scrollContainerRef} className="flex flex-row gap-3.5 overflow-x-auto pb-2">
                  {relatedDestinations.map((relatedDest) => (
                    <div
                      key={relatedDest.id}
                      className="flex-shrink-0 cursor-pointer"
                      style={{ width: "18rem" }}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleMiniCardClick(relatedDest.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleMiniCardClick(relatedDest.id);
                        }
                      }}
                    >
                      <MiniCard
                        destination={relatedDest}
                        isLoading={isLoadingDestination}
                        destinationName={DEBUG_MODE ? `${relatedDest.name} (${relatedDest.score})` : relatedDest.name}
                      />
                    </div>
                  ))}
                </div>
                {/* Scroll hint text */}
                <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
                  ← Scroll to see more →
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Service Unavailable"
        message={SERVICE_UNAVAILABLE_MESSAGE}
      />
      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        onEnableFastMode={() => toggleFastMode(true)}
      />
    </PersonalitiesSidebarProvider>
  );
}
