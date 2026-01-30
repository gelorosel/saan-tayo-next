"use client";

import { getActivityOptions, Vibe, Environment } from "@/src/data/activities";
import { personalities } from "@/src/data/personalities";
import type { PersonalityId } from "@/src/types/personality";

interface DebugPanelProps {
  answers: Record<string, string>;
  setAnswers: (answers: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  debugPersonality: PersonalityId | null;
  setDebugPersonality: (personality: PersonalityId | null) => void;
  onShowResults: () => void;
}

export function DebugPanel({
  answers,
  setAnswers,
  debugPersonality,
  setDebugPersonality,
  onShowResults,
}: DebugPanelProps) {
  return (
    <>
      <p className="text-xs text-orange-500 mb-2">🐛 DEBUG MODE ACTIVE</p>
      <div className="mb-4 p-4 border border-orange-300 rounded-lg bg-orange-50 space-y-4">
        <h3 className="text-sm font-bold mb-2">🐛 Debug: Quick Select All Options</h3>

        {/* Personality Selector */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Personality</h4>
          <div className="grid grid-cols-2 gap-2">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => setDebugPersonality(p.id)}
                className={`px-2 py-1 text-xs rounded border ${debugPersonality === p.id
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'bg-white border-gray-300 hover:border-orange-400'
                  }`}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Season</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Cool dry (Dec-Feb)", value: "cool_dry" },
              { label: "Hot dry (Mar-May)", value: "hot_dry" },
              { label: "Wet (Jun-Nov)", value: "wet" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const currentSeasons = answers.season?.split(',') || [];
                  const isSelected = currentSeasons.includes(opt.value);
                  const newSeasons = isSelected
                    ? currentSeasons.filter(s => s !== opt.value)
                    : [...currentSeasons, opt.value];
                  setAnswers(prev => ({ ...prev, season: newSeasons.join(',') }));
                }}
                className={`px-2 py-1 text-xs rounded border ${answers.season?.split(',').includes(opt.value)
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Environment</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Beach", value: "beach" },
              { label: "Mountains", value: "mountains" },
              { label: "City", value: "city" },
              { label: "Anywhere", value: "any" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers(prev => ({ ...prev, environment: opt.value }))}
                className={`px-2 py-1 text-xs rounded border ${answers.environment === opt.value
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-white border-gray-300 hover:border-green-400'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Vibe</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Rest", value: "rest" },
              { label: "Activities", value: "activities" },
              { label: "Sights", value: "sights" },
              { label: "Learn", value: "learn" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers(prev => ({ ...prev, vibe: opt.value }))}
                className={`px-2 py-1 text-xs rounded border ${answers.vibe === opt.value
                    ? 'bg-purple-500 text-white border-purple-600'
                    : 'bg-white border-gray-300 hover:border-purple-400'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        {answers.environment && (
          <div>
            <h4 className="text-xs font-semibold mb-2">Activity (multi-select)</h4>
            <div className="flex flex-wrap gap-2">
              {getActivityOptions(
                answers.environment as Environment,
                answers.vibe as Vibe
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const currentActivities = answers.activity?.split(',') || [];
                    const isSelected = currentActivities.includes(opt.value);
                    const newActivities = isSelected
                      ? currentActivities.filter(a => a !== opt.value)
                      : [...currentActivities, opt.value];
                    setAnswers(prev => ({ ...prev, activity: newActivities.join(',') }));
                  }}
                  className={`px-2 py-1 text-xs rounded border ${answers.activity?.split(',').includes(opt.value)
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-white border-gray-300 hover:border-indigo-400'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Island */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Island</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Luzon", value: "luzon" },
              { label: "Visayas", value: "visayas" },
              { label: "Mindanao", value: "mindanao" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers(prev => ({ ...prev, island: opt.value }))}
                className={`px-2 py-1 text-xs rounded border ${answers.island === opt.value
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-white border-gray-300 hover:border-red-400'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show Results Button */}
        <button
          onClick={onShowResults}
          disabled={!answers.island || !answers.environment || !answers.activity}
          className="w-full px-4 py-2 text-sm font-semibold rounded bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Show Results
        </button>
      </div>
    </>
  );
}
