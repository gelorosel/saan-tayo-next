// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";
import { activityOptionsByEnvironment, Environment, EnvironmentOrSurprise } from "@/src/data/activities";
import { pickUnique } from "@/lib/random";
import { uniqueByValue } from "@/lib/utils";
import { toPreference } from "@/lib/preference";
import { scoreDestinations } from "@/lib/score";
import { destinations } from "@/src/data/destinations";

import DestinationResultCard from "@/components/DestinationCard";

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
  const canGoBack = useMemo(() => step > 0, [step])

  const baseCurrent = questions[step];

  const current = useMemo(() => {
    if (!baseCurrent) return null;

    if (baseCurrent.id === "activity") {
      const environment = (answers.environment as Environment) || "beach";
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
        <h1 className="text-center text-3xl font-bold mb-6">Saan Tayo Punta?</h1>
        {current ?
          <QuestionCard
            question={current.question}
            options={current.options as Option[]}
            onSelect={handleSelect}
            onBack={handleBack}
            canGoBack={canGoBack}
            showSurprise={true}
          /> :
          <DestinationResultCard destination={scoreDestinations(toPreference(answers), destinations)[pick]} />
        }


        {canGoBack &&
          <div className="my-3">
            <button
              className="mt-4 underline text-sm"
              onClick={() => {
                setStep(0)
                setPick(0)
              }}
            >
              Start over
            </button>
            {!current &&
              <button
                className="ml-[20px] mt-4 underline text-sm"
                onClick={() => setPick(pick + 1)}
              >
                I've been here!
              </button>
            }
          </div>
        }
      </div>
    </main>
  );
}
