// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";
import { activityOptionsByEnvironment, Environment, EnvironmentOrSurprise } from "@/src/data/activities";
import { pickUnique } from "@/lib/random";
import { uniqueByValue } from "@/lib/utils";
import { toPreference } from "@/lib/preference";
import { scoreDestinations } from "@/lib/score";
import { destinations } from "@/src/data/destinations";
import { prettifyActivity } from "@/lib/utils";

import DestinationResultCard from "@/components/DestinationCard";
import MiniCard from "@/components/MiniCard";
import { de } from "zod/v4/locales";

const FAST_MODE_KEY = "fastMode";

const ENV_SURPRISE_FLAG = "__envSurprise";

type Option = { label: string; value: string };

const randomPick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const environments: Environment[] = ["beach", "mountains", "city"];

const allActivityOptions = uniqueByValue(
  Object.values(activityOptionsByEnvironment)
    .flat()
    .filter((o) => o.value !== "surprise")
);

// pick an option value for "surprise" based on the current step + answers
function resolveSurprise(questionId: string, options: Option[], answers: Record<string, string>) {
  if (questionId === "environment") {
    return randomPick(environments);
  }

  if (questionId === "activity") {
    const environment = (answers.environment as EnvironmentOrSurprise) || "beach";

    if (environment === "surprise") {
      // choose from the 4 currently shown (exclude surprise)
      const shown = options.filter((o) => o.value !== "surprise");
      return randomPick(shown).value;
    }

    const envOpts = activityOptionsByEnvironment[environment].filter((o) => o.value !== "surprise");
    return randomPick(envOpts).value;
  }

  // default: pick from this question's options, excluding surprise itself
  const pool = options.filter((o) => o.value !== "surprise");
  return randomPick(pool).value;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [hasShownDestination, setHasShownDestination] = useState(false);
  const canGoBack = useMemo(() => step > 0, [step])
  const preferences = useMemo(() => toPreference(answers), [answers])
  const scoredDestinations = useMemo(
    () => scoreDestinations(preferences, destinations),
    [preferences]
  );
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

  // Mark that we've shown a destination for the first time
  useEffect(() => {
    if (!baseCurrent && finalDestinations.length > 0 && !hasShownDestination) {
      setHasShownDestination(true);
    }
  }, [baseCurrent, finalDestinations.length, hasShownDestination]);

  const toggleFastMode = () => {
    const newValue = !fastMode;
    setFastMode(newValue);
    localStorage.setItem(FAST_MODE_KEY, String(newValue));
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent("fastModeChanged", { detail: newValue }));
  };

  const current = useMemo(() => {
    if (!baseCurrent) return null;

    if (baseCurrent.id === "activity") {
      const environment = (answers.environment as Environment);
      const envWasSurprise = answers[ENV_SURPRISE_FLAG] === "true";

      // If user picked Surprise me on environment, show 6 random unique activities
      if (envWasSurprise) {
        const sixRandom = pickUnique(allActivityOptions, 6);

        return {
          ...baseCurrent,
          options: [
            ...sixRandom,
            { label: "Surprise me", value: "surprise" },
          ],
        };
      }

      return {
        ...baseCurrent,
        options: activityOptionsByEnvironment[environment],
      };
    }


    return baseCurrent;
  }, [baseCurrent, answers.environment]);

  // Mark that we've shown a destination for the first time
  useEffect(() => {
    if (!baseCurrent && finalDestinations.length > 0 && !hasShownDestination) {
      setHasShownDestination(true);
    }
  }, [baseCurrent, finalDestinations.length, hasShownDestination]);

  // Get related destinations: region destinations first, then rest of finalDestinations
  const relatedDestinations = useMemo(() => {
    if (current || finalDestinations.length === 0) {
      return [];
    }

    const currentDestination = finalDestinations[pick];
    const currentDestinationId = currentDestination.id;

    // Get region destinations (from all destinations, filtered by region)
    let regionDestinations: typeof finalDestinations = [];
    if (currentDestination.location?.region) {
      const regionDests = destinations
        .filter(d =>
          d.location?.region === currentDestination.location?.region &&
          d.id !== currentDestinationId
        );

      if (regionDests.length > 0) {
        // Score the region destinations using user preferences
        const scoredRegionDests = scoreDestinations(preferences, regionDests);
        // Get top 5 region destinations
        regionDestinations = scoredRegionDests.slice(0, 5);
      }
    }

    // Get the rest of finalDestinations (excluding current and region destinations)
    const regionDestinationIds = new Set(regionDestinations.map(d => d.id));
    const restOfFinalDestinations = finalDestinations
      .filter(d => d.id !== currentDestinationId && !regionDestinationIds.has(d.id));

    // Combine: region destinations first, then rest of finalDestinations
    // Limit total to a reasonable number (e.g., 10)
    const combined = [...regionDestinations, ...restOfFinalDestinations].slice(0, 5);

    return combined;
  }, [current, finalDestinations, pick, preferences]);

  const handleMiniCardClick = (destinationId: string) => {
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
  };

  const goNext = (questionId: string, chosenValue: string, meta?: { envWasSurprise?: boolean }) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: chosenValue };

      if (questionId === "environment") {
        delete next.activity; // changing environment invalidates activity

        if (meta?.envWasSurprise) next[ENV_SURPRISE_FLAG] = "true";
        else delete next[ENV_SURPRISE_FLAG];
      }

      return next;
    });

    setStep((prev) => prev + 1);
  };

  const handleSelect = (value: string) => {
    if (!current) return;

    // Surprise behavior
    if (value === "surprise") {
      // Special case: environment surprise should still pick an environment,
      // but we keep a flag that it was chosen via surprise.
      if (current.id === "environment") {
        const resolvedEnv = randomPick(environments); // beach/mountains/city
        goNext("environment", resolvedEnv, { envWasSurprise: true });
        return;
      }

      const resolved = resolveSurprise(current.id, current.options as Option[], answers);
      goNext(current.id, resolved);
      return;
    }

    // Normal select
    goNext(current.id, value);
  };

  const handleBack = () => {
    setAnswers((prev) => {
      const next = { ...prev };

      const currentQuestion = questions[step];

      if (!currentQuestion) return next;

      // If we're backing out of the activity step, clear activity
      if (currentQuestion.id === "activity") {
        delete next.activity;
      }

      // If we're backing out of the environment step, clear the surprise flag
      if (currentQuestion.id === "environment") {
        delete next.__envSurprise;
      }

      return next;
    });

    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="max-w-xl w-full mx-auto">
          <h1 className="text-styled text-4xl mt-6">Saan Tayo Next?</h1>
          <h2 className="text-xl font-semibold mb-2">Where to next?</h2>
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
          {current ?
            <QuestionCard
              question={current.question}
              options={current.options as Option[]}
              onSelect={handleSelect}
              onBack={handleBack}
              canGoBack={canGoBack}
              showSurprise={true}
            /> :
            finalDestinations.length ? (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <DestinationResultCard
                  key={finalDestinations[pick].id}
                  destination={finalDestinations[pick]}
                  preferredActivity={preferences.activity}
                  reasons={finalDestinations[pick].reasons}
                  onLoadingChange={setIsDestinationLoading}
                />
              </div>
            ) : (
              <p>no destinations matched your criteria</p>
            )
          }


          {canGoBack &&
            <div className="my-3 flex flex-row justify-between gap-4">
              <button
                className="underline text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setStep(0)
                  setPick(0)
                }}
                disabled={isDestinationLoading}
              >
                Start over
              </button>
              {!current && pick + 1 < finalDestinations.length &&
                <button
                  className="underline text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPick(pick + 1)}
                  disabled={isDestinationLoading}
                >
                  I've been here!
                </button>
              }
            </div>
          }
        </div>

        {/* More destinations section */}
        {!isDestinationLoading && relatedDestinations.length > 0 && (
          <div className="w-full mt-10">
            <h3 className="text-base font-semibold mb-3">
              More {answers.activity ? prettifyActivity(answers.activity) : "to see"} in {finalDestinations[pick].island.charAt(0).toUpperCase() + finalDestinations[pick].island.slice(1)}
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
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ← Scroll to see more →
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
