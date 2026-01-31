"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    formatTimeUntilReset,
    getRemainingRequests,
    MAX_DESCRIPTION_REQUESTS
} from "@/lib/rateLimit";
import { Clock } from "lucide-react";

interface RateLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnableFastMode?: () => void;
}

export function RateLimitModal({ isOpen, onClose, onEnableFastMode }: RateLimitModalProps) {
    const [timeRemaining, setTimeRemaining] = useState("");

    const handleEnableFastMode = () => {
        if (onEnableFastMode) {
            onEnableFastMode();
        }
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            // Update time remaining immediately
            setTimeRemaining(formatTimeUntilReset());

            // Update every minute
            const interval = setInterval(() => {
                setTimeRemaining(formatTimeUntilReset());
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <DialogTitle className="text-2xl">Thanks for using my app!</DialogTitle>
                    </div>
                    <DialogDescription className="text-base space-y-4 pt-4">
                        <p>
                            You've explored <strong>{MAX_DESCRIPTION_REQUESTS} amazing destinations</strong>! Thank you for your support, but we need to pause here for now.
                        </p>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium">Come back in:</p>
                            <p className="text-2xl font-bold text-primary">
                                {timeRemaining}
                            </p>
                        </div>

                        <div className="space-y-2 text-sm">
                            <p className="font-medium">In the meantime, you can:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Keep exploring destinations (just without the extra details)</li>
                                <li>Click "I've been here" to discover more places</li>
                                <li>Turn on Fast Mode to browse quickly</li>
                                <li>Share your awesome results with friends!</li>
                            </ul>
                        </div>

                        {/* <p className="text-xs text-muted-foreground">
                            💡 This small limit helps us keep the lights on and the app free for all travelers!
                        </p> */}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleEnableFastMode} className="flex-1" size="lg">
                        Explore with fast mode
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
