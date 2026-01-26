// src/components/QuestionCard.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Question, Option } from "@/src/types/question";

interface Props {
    current: Question;
    options: Option[];
    onSelect: (value: string) => void;
    onBack?: () => void;
    canGoBack?: boolean;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function QuestionCard({
    current,
    options,
    onSelect,
    onBack,
    canGoBack = false,
}: Props) {
    // Randomize options if current.randomize is true
    const displayOptions = useMemo(() => {
        if (current.randomize) {
            return shuffleArray(options);
        }
        return options;
    }, [current.id, options, current.randomize]);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 w-full max-w-xl my-6">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{current.question}</h2>

                    {current.id === "island" ? (
                        // specific styling for island question
                        <div className={`grid grid-cols-1 gap-3`}>
                            {displayOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => onSelect(opt.value)}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className={`grid grid-cols-2 gap-3`}>
                            {displayOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => onSelect(opt.value)}
                                    className="h-30 sm:h-20"
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        {canGoBack && (<Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            disabled={!canGoBack}
                        >
                            Go back
                        </Button>)}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
