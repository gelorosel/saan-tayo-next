"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function ErrorModal({
    isOpen,
    onClose,
    title = "Something went wrong",
    message = "An unexpected error occurred. Please try again.",
}: ErrorModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">⚠️ {title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>

                <Button
                    onClick={onClose}
                    className="w-full"
                    size="lg"
                >
                    Got it
                </Button>
            </DialogContent>
        </Dialog>
    );
}
