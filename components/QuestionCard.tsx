"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
    question: string;
    options: string[];
    onSelect: (value: string) => void;
}

export function QuestionCard({ question, options, onSelect }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-6">
                <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">{question}</h2>

                    <div className="grid grid-cols-2 gap-3">
                        {options.map((opt) => (
                            <Button
                                key={opt}
                                variant="outline"
                                onClick={() => onSelect(opt)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
