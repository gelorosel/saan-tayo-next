// src/components/QuestionCard.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
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
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    // Reset selection when question changes
    useEffect(() => {
        setSelectedValue(null);
        setIsExiting(false);
    }, [current.id]);

    // shuffle options if current.shuffle is true
    const displayOptions = useMemo(() => {
        if (current.shuffle) {
            return shuffleArray(options);
        }
        return options;
    }, [current.id, options, current.shuffle]);

    const handleNext = () => {
        if (selectedValue && !isExiting) {
            setDirection('forward');
            setIsExiting(true);
            // Wait for animation to complete before moving to next question
            setTimeout(() => {
                onSelect(selectedValue);
            }, 300); // Match animation duration
        }
    };

    const handleBack = () => {
        if (!isExiting && onBack) {
            setDirection('backward');
            setSelectedValue(null);
            setIsExiting(true);
            // Wait for animation to complete before going back
            setTimeout(() => {
                onBack();
            }, 300); // Match animation duration
        }
    };

    return (
        <motion.div
            key={current.id}
            initial={{ opacity: 0, x: direction === 'forward' ? 50 : -50 }}
            animate={{
                opacity: isExiting ? 0 : 1,
                x: isExiting ? (direction === 'forward' ? -50 : 50) : 0,
                transition: { duration: 0.2, ease: "easeInOut" }
            }}
        >
            <Card className="py-6 sm:p-6 w-full max-w-xl my-6">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{current.question}</h2>

                    {current.id === "island" ? (
                        // specific styling for island question
                        <div className={`grid grid-cols-1 gap-3`}>
                            {displayOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={!isExiting && selectedValue === opt.value ? "default" : "outline"}
                                    disabled={isExiting}
                                    size="lg"
                                    onClick={() => setSelectedValue(opt.value)}
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
                                    variant={!isExiting && selectedValue === opt.value ? "default" : "outline"}
                                    disabled={isExiting}
                                    size="lg"
                                    onClick={() => setSelectedValue(opt.value)}
                                    className="h-30 p-3 sm:p-6 sm:h-20 "
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        {canGoBack ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                onClick={handleBack}
                                disabled={isExiting}
                            >
                                Go back
                            </Button>
                        ) : <div />}

                        <Button
                            type="button"
                            variant="default"
                            size="md"
                            onClick={handleNext}
                            disabled={!selectedValue || isExiting}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
