// src/components/QuestionCard.tsx
"use client";

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

export function QuestionCard({
    current,
    options,
    onSelect,
    onBack,
    canGoBack = false,
}: Props) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 w-full max-w-xl my-6">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{current.question}</h2>

                    <div className={`grid ${current.id === "island" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                        {options.map((opt) => (
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
