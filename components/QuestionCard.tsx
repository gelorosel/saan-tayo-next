// src/components/QuestionCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Option {
    label: string;
    value: string;
}

interface Props {
    question: string;
    options: Option[];
    onSelect: (value: string) => void;
    onBack?: () => void;
    canGoBack?: boolean;
    showSurprise?: boolean;
}

export function QuestionCard({
    question,
    options,
    onSelect,
    onBack,
    canGoBack = false,
    showSurprise = true,
}: Props) {
    const hasSurpriseInOptions = options.some((o) => o.value === "surprise");
    const visibleOptions = hasSurpriseInOptions
        ? options.filter((o) => o.value !== "surprise") // keep Surprise only in footer
        : options;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 w-full max-w-xl">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{question}</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {visibleOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                variant="outline"
                                onClick={() => onSelect(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {canGoBack && (<Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            disabled={!canGoBack}
                        >
                            Back
                        </Button>)}

                        {showSurprise && (
                            <div className="ml-auto">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onSelect("surprise")}
                                >
                                    Surprise me
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
