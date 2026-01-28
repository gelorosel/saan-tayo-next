"use client";

import { useState } from "react";
import { personalities, personalityById } from "@/src/data/personalities";
import { PersonalityProfile } from "@/src/types/personality";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X, ChevronRight } from "lucide-react";

export function PersonalitiesSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityProfile | null>(null);

  // Sort personalities by category: core, hybrid, rare
  const sortedPersonalities = [...personalities].sort((a, b) => {
    const categoryOrder = { core: 0, hybrid: 1, rare: 2 };
    return categoryOrder[a.category] - categoryOrder[b.category];
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "core":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "hybrid":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "rare":
        return "bg-pink-200 text-pink-700 border-pink-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPersonalityName = (id: string) => {
    return personalityById.get(id as PersonalityProfile["id"])?.name || id;
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed left-4 top-4 z-40 shadow-md"
      >
        <ChevronRight className="h-4 w-4 mr-2" />
        Personality Types
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setIsOpen(false);
            setSelectedPersonality(null);
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Personality Types</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setSelectedPersonality(null);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Personality List */}
          <div className="space-y-4">
            {sortedPersonalities.map((personality) => {
              const isSelected = selectedPersonality?.id === personality.id;

              return (
                <div
                  key={personality.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    setSelectedPersonality(
                      isSelected ? null : personality
                    )
                  }
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-3xl flex-shrink-0">
                      {personality.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight">
                        {personality.name}
                      </h3>
                      <Badge
                        className={`mt-1 ${getCategoryColor(
                          personality.category
                        )} capitalize text-xs`}
                      >
                        {personality.category} traveler
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="mt-4 space-y-3 text-sm animate-in slide-in-from-top-2 duration-200">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium mb-1 flex items-center gap-1">
                          <span>✨</span> Strengths
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {personality.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Struggles */}
                      <div>
                        <h4 className="font-medium mb-1 flex items-center gap-1">
                          <span>⚡</span> Struggles
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {personality.struggles.map((struggle, idx) => (
                            <li key={idx}>{struggle}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Compatible With */}
                      {personality.compatibleWith.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-1">
                            <span>🤝</span> Ideal travel companions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {personality.compatibleWith.map((id) => (
                              <Badge
                                key={id}
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                {getPersonalityName(id)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Avoid With */}
                      {personality.avoidWith.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-1">
                            <span>⚠️</span> Might struggle with
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {personality.avoidWith.map((id) => (
                              <Badge
                                key={id}
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200"
                              >
                                {getPersonalityName(id)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
