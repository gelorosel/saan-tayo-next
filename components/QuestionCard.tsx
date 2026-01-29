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
    disabled?: boolean;
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
    disabled = false,
}: Props) {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [textValue, setTextValue] = useState<string>("");
    const [textError, setTextError] = useState<string>("");
    const [textWarning, setTextWarning] = useState<string>("");
    const [isExiting, setIsExiting] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    // Determine layout configuration based on question type
    const useSingleColumn = current.id === "island" || current.id === "season";
    const isMultiSelect = current.multiSelect || false;

    // Reset selection when question changes
    useEffect(() => {
        setSelectedValue(null);
        setSelectedValues([]);
        setTextValue("");
        setTextError("");
        setTextWarning("");
        setIsExiting(false);
    }, [current.id]);

    // shuffle options if current.shuffle is true
    const displayOptions = useMemo(() => {
        if (current.shuffle) {
            return shuffleArray(options);
        }
        return options;
    }, [current.id, options, current.shuffle]);

    // Validate name input
    const validateNameInput = (value: string): string => {
        if (value.length === 0) {
            return "";
        }

        if (value.length >= 255) {
            return "Congrats on the long name 👍 use a nickname";
        }

        // Allow letters, numbers, hspaces, hyphens, apostrophes, and common name characters
        const nameRegex = /^[a-zA-Z0-9\s\-'\.]+$/;
        if (!nameRegex.test(value.trim())) {
            return "Name can only contain letters, numbers, spaces, hyphens, and apostrophes";
        }

        return "";
    };

    const handleTextChange = (value: string) => {
        if (value.length <= 255) {
            setTextValue(value);
        }

        // Only validate if it's a name field
        if (current.id === "name") {
            const error = validateNameInput(value);
            setTextError(error);

            // Show warning (not blocking) if name is too long
            if (value.length > 12 && !error) {
                setTextWarning("Your name might not appear correctly, please use a nickname");
            } else {
                setTextWarning("");
            }
        }
    };

    const handleToggleMultiSelect = (value: string) => {
        if (isExiting) return;

        setSelectedValues(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else {
                const maxSelections = current.maxSelections || Infinity;
                if (prev.length < maxSelections) {
                    return [...prev, value];
                }
                return prev;
            }
        });
    };

    const handleNext = () => {
        if (isExiting) return;

        let value: string | null = null;

        if (current.type === "text") {
            value = textValue;
        } else if (current.multiSelect) {
            value = selectedValues.join(",");
        } else {
            value = selectedValue;
        }

        if (value && value.trim()) {
            setDirection('forward');
            setIsExiting(true);
            // Wait for animation to complete before moving to next question
            setTimeout(() => {
                onSelect(value);
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
            initial={{ opacity: 0, x: direction === 'forward' ? 20 : -20 }}
            animate={{
                opacity: isExiting ? 0 : 1,
                x: isExiting ? (direction === 'forward' ? -20 : 20) : 0,
                transition: { duration: 0.2, ease: "easeInOut" }
            }}
        >
            <Card className="py-6 sm:p-6 w-full max-w-xl my-6">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{current.question}</h2>

                    {current.type === "text" ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={textValue}
                                onChange={(e) => handleTextChange(e.target.value)}
                                placeholder={current.placeholder || "Enter your answer"}
                                disabled={isExiting || disabled}
                                className={`w-full px-4 py-3 rounded-md border ${textError ? 'border-red-500 focus:ring-red-500' : textWarning ? 'border-yellow-500 focus:ring-yellow-500' : 'border-input focus:ring-ring'
                                    } text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && textValue.trim() && !textError) {
                                        handleNext();
                                    }
                                }}
                            />
                            {textError && (
                                <p className="text-sm text-red-500">{textError}</p>
                            )}
                            {!textError && textWarning && (
                                <p className="text-sm text-yellow-600">{textWarning}</p>
                            )}
                        </div>
                    ) : (
                        <div className={`grid ${useSingleColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                            {displayOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={!isExiting && (isMultiSelect ? selectedValues.includes(opt.value) : selectedValue === opt.value) ? "default" : "outline"}
                                    disabled={isExiting || disabled}
                                    size="lg"
                                    onClick={() => isMultiSelect ? handleToggleMultiSelect(opt.value) : setSelectedValue(opt.value)}
                                    className={useSingleColumn
                                        ? "whitespace-normal text-center leading-tight"
                                        : "h-30 p-3 sm:p-6 sm:h-20 whitespace-normal text-center leading-tight break-words"
                                    }
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
                                disabled={isExiting || disabled}
                            >
                                Go back
                            </Button>
                        ) : <div />}

                        <Button
                            type="button"
                            variant="default"
                            size="md"
                            onClick={handleNext}
                            disabled={
                                isExiting ||
                                disabled ||
                                (current.type === "text"
                                    ? !textValue.trim() || !!textError
                                    : current.multiSelect
                                        ? selectedValues.length < (current.minSelections || 1)
                                        : !selectedValue)
                            }
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
