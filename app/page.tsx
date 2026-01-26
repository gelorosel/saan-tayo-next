// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";
import { getActivityOptions, Vibe, Environment } from "@/src/data/activities";
import { toPreference } from "@/lib/preference";
import { scoreDestinations } from "@/lib/score";
import { personalityScore } from "@/lib/personalityScore";
import { destinations } from "@/src/data/destinations";
import { personalityById } from "@/src/data/personalities";
import { Activity } from "@/src/types/preference";
import { Option } from "@/src/types/question";

import MiniCard from "@/components/MiniCard";
import { PersonalityResultCard } from "@/components/PersonalityResultCard";
import { DevelopmentModal } from "@/components/DevelopmentModal";

const FAST_MODE_KEY = "fastMode";


export default function Home() {
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fastMode, setFastMode] = useState(false);
  const [hasShownDestination, setHasShownDestination] = useState(false);

  const canGoBack = step > 0;
  const preferences = useMemo(() => toPreference(answers), [answers]);
  const personalityResult = useMemo(() => personalityScore(answers), [answers]);
  const personalityProfile = useMemo(() => {
    if (!personalityResult) return null;
    return personalityById.get(personalityResult.primary) ?? null;
  }, [personalityResult]);
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
    return scoreDestinations(
      preferences,
      destinations,
      personalityResult?.preferredActivities ?? []
    );
  }, [preferences, personalityResult?.preferredActivities]);
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

  useEffect(() => {
    // Load fast mode preference from localStorage
    const saved = localStorage.getItem(FAST_MODE_KEY);
    if (saved !== null) {
      setFastMode(saved === "true");
    }
  }, []);

  const baseCurrent = questions[step];

  const toggleFastMode = useCallback(() => {
    const newValue = !fastMode;
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
      return { ...baseCurrent, options: getActivityOptions(environment, vibe) };
    }

    return baseCurrent;
  }, [baseCurrent, answers.environment, answers.vibe]);

  // Mark that we've shown a destination for the first time
  useEffect(() => {
    if (!baseCurrent && finalDestinations.length > 0 && !hasShownDestination) {
      setHasShownDestination(true);
      console.log("preferences", preferences);
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
          personalityResult?.preferredActivities ?? []
        );
        regionDestinations = scoredRegionDests.slice(0, 5);
      }
    }

    // Get the rest of finalDestinations (excluding current and region destinations)
    const regionDestinationIds = new Set(regionDestinations.map(d => d.id));
    const restOfFinalDestinations = finalDestinations.filter(
      d => d.id !== currentDestinationId && !regionDestinationIds.has(d.id)
    );

    // Combine: region destinations first, then rest of finalDestinations, limit to 5
    return [...regionDestinations, ...restOfFinalDestinations].slice(0, 5);
  }, [current, finalDestinations, pick, preferences, personalityResult?.preferredActivities]);

  const handleMiniCardClick = useCallback((destinationId: string) => {
    setFinalDestinations((prev) => {
      if (prev.length === 0) return prev;

      const fromIndex = prev.findIndex((d) => d.id === destinationId);
      if (fromIndex === -1) return prev;

      // Move clicked destination to "next" position (right after current pick)
      const nextIndexRaw = Math.min(pick + 1, prev.length - 1);
      const arr = [...prev];
      const [item] = arr.splice(fromIndex, 1);
      const insertIndex = fromIndex < nextIndexRaw ? nextIndexRaw - 1 : nextIndexRaw;
      arr.splice(insertIndex, 0, item);
      return arr;
    });

    setPick((prevPick) => Math.min(prevPick + 1, Math.max(0, finalDestinations.length - 1)));

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pick, finalDestinations.length]);

  const goNext = useCallback((questionId: string, chosenValue: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: chosenValue };

      if (questionId === "environment") {
        delete next.activity; // changing environment invalidates activity
      }

      return next;
    });

    setStep((prev) => prev + 1);
  }, []);

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
  }, []);

  return (
    <>
      <DevelopmentModal />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="max-w-xl w-full mx-auto">
          <h1 className="text-styled text-4xl mt-6">Saan Tayo Next?</h1>
          <h2 className="text-xl font-semibold mb-4">Find your next destination</h2>
          {current ?
            <QuestionCard
              current={current}
              options={current.options as Option[]}
              onSelect={handleSelect}
              onBack={handleBack}
              canGoBack={canGoBack}
            /> :
            finalDestinations.length ? (
              <div className="flex flex-col lg:flex-row items-start">
                {personalityProfile && (
                  <PersonalityResultCard
                    personality={personalityProfile}
                    answers={answers}
                    destination={finalDestinations[pick]}
                    preferredActivity={primaryActivity}
                    fastMode={fastMode}
                  />
                )}
              </div>
            ) : (
              <p>No places matched this moment.</p>
            )
          }

          {canGoBack &&
            <div className="my-3 flex flex-row justify-between gap-4">
              <button
                className="underline text-sm cursor-pointer"
                onClick={handleStartOver}
              >
                Start over
              </button>
            </div>
          }
          {hasShownDestination && (
            <label className="flex items-center gap-2 text-sm mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={fastMode}
                onChange={toggleFastMode}
                className="cursor-pointer"
              />
              <span>Fast mode (skip loading images and description)</span>
            </label>
          )}
        </div>

        {/* More destinations section */}
        {relatedDestinations.length > 0 && (
          <div className="w-full mt-10">
            <h3 className="text-base font-semibold mb-3">
              If you've already been to {finalDestinations[pick].name}, you might also like:
            </h3>
            <div className="relative -mx-6 px-6">
              {/* Scrollable container */}
              <div className="flex flex-row gap-3.5 overflow-x-auto pb-2">
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
                    <MiniCard destination={relatedDest} />
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
    </>
  );
}
