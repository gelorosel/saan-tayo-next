"use client";

import { useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/src/data/questions";

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = questions[step];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: value.toLowerCase().replace(/\s/g, "_"),
    }));

    setStep((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {current ? (
        <QuestionCard
          question={current.question}
          options={current.options}
          onSelect={handleSelect}
        />
      ) : (
        <pre className="text-sm">
          {JSON.stringify(answers, null, 2)}
        </pre>
      )}
    </main>
  );
}
