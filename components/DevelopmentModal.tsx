"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DevelopmentModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already seen the modal
        const hasSeenModal = localStorage.getItem("hasSeenDevModal");

        if (!hasSeenModal) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("hasSeenDevModal", "true");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">🚧 Development Mode</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-muted-foreground leading-relaxed">
                        This app is currently in <strong>active development</strong> and is not ready for public use.
                    </p>

                    <p className="text-muted-foreground leading-relaxed">
                        Please <strong>do not share</strong> this link with anyone at this time. I appreciate your understanding!
                    </p>

                    <div className="bg-muted p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">
                            <strong>PLEASE</strong> let me know when something breaks!
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleClose}
                    className="w-full"
                    size="lg"
                >
                    I Understand
                </Button>
            </DialogContent>
        </Dialog>
    );
}
