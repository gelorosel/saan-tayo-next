// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";
import { activityOptionsByEnvironment, Environment } from "@/src/data/activities";
import { toPreference } from "@/lib/preference";
import { scoreDestinations } from "@/lib/score";
import { destinations } from "@/src/data/destinations";
import { prettifyActivity } from "@/lib/utils";

import DestinationResultCard from "@/components/DestinationCard";
import MiniCard from "@/components/MiniCard";

const FAST_MODE_KEY = "fastMode";

type Option = { label: string; value: string };

const seasonLabels: Record<string, string> = {
  cool_dry: "cool dry season",
  hot_dry: "hot dry season",
  wet: "wet season",
};

const prettyEnvironment = (value?: string) => {
  if (!value) return "somewhere that fits";
  if (value === "beach") return "the beach";
  if (value === "mountains") return "the mountains";
  if (value === "city") return "the city";
  return "somewhere that fits";
};

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
      const environment = (answers.environment as Environment) || "beach";

      return {
        ...baseCurrent,
        options: activityOptionsByEnvironment[environment],
      };
    }


    return baseCurrent;
  }, [baseCurrent, answers.environment]);

  const resultStatement = useMemo(() => {
    if (current || finalDestinations.length === 0) return "";

    switch (preferences.environment) {
      case "beach":
        return "Right now, you belong by the sea.";
      case "mountains":
        return "Right now, you belong somewhere high and quiet.";
      case "city":
        return "Right now, you belong in the middle of the energy.";
      default:
        return "Right now, you belong somewhere that fits.";
    }
  }, [current, finalDestinations.length, preferences.environment]);

  const resultReasons = useMemo(() => {
    if (current || finalDestinations.length === 0) return [];

    const items: string[] = [];
    if (preferences.environment && preferences.activity) {
      items.push(
        `You wanted ${prettyEnvironment(preferences.environment)} + ${prettifyActivity(preferences.activity).toLowerCase()}.`
      );
    } else if (preferences.environment) {
      items.push(`You wanted ${prettyEnvironment(preferences.environment)}.`);
    } else if (preferences.activity) {
      items.push(`You wanted to ${prettifyActivity(preferences.activity).toLowerCase()}.`);
    }

    if (answers.season) {
      items.push(`Your timing fits the ${seasonLabels[answers.season] ?? "right season"}.`);
    }

    if (answers.island) {
      items.push(`It keeps you in ${answers.island.charAt(0).toUpperCase() + answers.island.slice(1)}.`);
    }

    return items.slice(0, 3);
  }, [
    answers.island,
    answers.season,
    current,
    finalDestinations.length,
    preferences.activity,
    preferences.environment,
  ]);

  const shareSentence = useMemo(() => {
    if (current || finalDestinations.length === 0) return "";
    const name = finalDestinations[pick].name;
    return `Right now, I belong in ${name}.`;
  }, [current, finalDestinations, pick]);

  useEffect(() => {
    if (!shareSentence) return;

    document.title = `Saan Tayo Next? — ${shareSentence}`;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", shareSentence);
    }

    const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionTag) {
      ogDescriptionTag.setAttribute("content", shareSentence);
    }

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", shareSentence);
    }
  }, [shareSentence]);

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

  const goNext = (questionId: string, chosenValue: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: chosenValue };

      if (questionId === "environment") {
        delete next.activity; // changing environment invalidates activity
      }

      return next;
    });

    setStep((prev) => prev + 1);
  };

  const handleSelect = (value: string) => {
    if (!current) return;
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

      return next;
    });

    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="max-w-xl w-full mx-auto">
          <h1 className="text-styled text-4xl mt-6">Saan Tayo Next?</h1>
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
            /> :
            finalDestinations.length ? (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <DestinationResultCard
                  key={finalDestinations[pick].id}
                  destination={finalDestinations[pick]}
                  preferredActivity={preferences.activity}
                  statement={resultStatement}
                  reasons={resultReasons}
                  shareText={shareSentence}
                  onShowAnother={pick + 1 < finalDestinations.length ? () => setPick(pick + 1) : undefined}
                  onLoadingChange={setIsDestinationLoading}
                />
              </div>
            ) : (
              <p>No places matched this moment.</p>
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
                Start again
              </button>
            </div>
          }
        </div>

        {/* More destinations section */}
        {!isDestinationLoading && relatedDestinations.length > 0 && (
          <div className="w-full mt-10">
            <h3 className="text-base font-semibold mb-3">
              More {answers.activity ? prettifyActivity(answers.activity) : "to see"} around{" "}
              {finalDestinations[pick].island.charAt(0).toUpperCase() + finalDestinations[pick].island.slice(1)}
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
  );
}
