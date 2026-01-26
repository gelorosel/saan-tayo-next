"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, pretty } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Destination } from "@/src/types/destination";
import { PersonalityProfile } from "@/src/types/personality";
import { toPng } from "html-to-image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";

interface UnsplashImageData {
    id?: string;
    url: string;
    photographerName: string;
    photographerUsername: string;
    photographerUrl: string;
    downloadLocation?: string;
}

interface ShareResultModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    personality: PersonalityProfile;
    destination: Destination;
    heroImgSrc: string;
    imageData: UnsplashImageData | null;
    activities: string[];
    perfectCompanions: PersonalityProfile[];
    struggleCompanions: PersonalityProfile[];
}

export function ShareResultModal({
    isOpen,
    onOpenChange,
    personality,
    destination,
    heroImgSrc,
    imageData,
    activities,
    perfectCompanions,
    struggleCompanions,
}: ShareResultModalProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    const generateImage = async () => {
        if (!exportRef.current) {
            console.error('exportRef.current is null!');
            return;
        }

        try {
            setIsGenerating(true);
            console.log('exportRef.current:', exportRef.current);

            // Wait for the element to be in the DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Wait for all images to load
            const images = exportRef.current.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve; // Continue even if image fails
                    });
                })
            );

            // Extra wait to ensure everything is painted
            await new Promise(resolve => setTimeout(resolve, 300));

            console.log('Attempting to generate image...');
            const dataUrl = await toPng(exportRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: 600,
                height: 1200,
            });
            console.log('Image generated successfully!');

            setGeneratedImage(dataUrl);
        } catch (error) {
            console.error("Error generating image:", error);
            alert('Failed to generate image. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportImage = async () => {
        if (!generatedImage || isExporting) return;

        try {
            setIsExporting(true);

            const link = document.createElement("a");
            link.download = `${destination.name.replace(/\s+/g, "-").toLowerCase()}-result.png`;
            link.href = generatedImage;
            link.click();
        } catch (error) {
            console.error("Error exporting image:", error);
        } finally {
            setIsExporting(false);
        }
    };

    // Generate image when modal opens
    useEffect(() => {
        if (isOpen) {
            setGeneratedImage(null);
            // Delay to ensure the dialog and hidden element are fully rendered
            const timer = setTimeout(() => {
                console.log('Starting image generation...');
                generateImage();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Share Your Next Destination</DialogTitle>
                </DialogHeader>

                {/* Display generated image or loading state */}
                {isGenerating ? (
                    <div className="w-full aspect-[1/2] flex items-center justify-center bg-muted rounded-lg">
                        <p className="text-muted-foreground">Generating preview...</p>
                    </div>
                ) : generatedImage ? (
                    <div className="w-full">
                        <img
                            src={generatedImage}
                            alt="Share preview"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                ) : null}

                {/* Hidden export version for generation - 1:2 aspect ratio - always rendered */}
                <div
                    ref={exportRef}
                    className="fixed w-[600px] h-[1200px] pointer-events-none bg-white"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: -999,
                        opacity: isGenerating ? 1 : 0.01,
                        visibility: generatedImage ? 'hidden' : 'visible'
                    }}
                >
                    <Card className="overflow-hidden rounded-2xl shadow-sm w-full h-full">
                        <CardContent className="p-10 space-y-4 h-full flex flex-col">
                            {/* Header Statement */}
                            <h1 className="text-center text-styled text-5xl mt-6">Saan Tayo Next?</h1>

                            <div className="mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-start gap-4">
                                            <p className="text-6xl">{personality.emoji}</p>
                                            <h2 className="text-4xl font-bold">I'm {personality.name}</h2>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={personality.category} className="capitalize text-lg px-4 py-2 mt-3">
                                    {personality.category} traveler
                                </Badge>
                            </div>

                            <p className="text-lg leading-relaxed">
                                {personality.description}
                            </p>

                            {/* Companions */}
                            {perfectCompanions.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-medium">🤝 Ideal travel companions</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {perfectCompanions.map((c) => (
                                            <Badge
                                                key={c.id}
                                                variant="ideal"
                                                className="flex items-center gap-1 text-lg px-4 py-2"
                                            >
                                                <span>{c.emoji}</span> {c.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {struggleCompanions.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-medium">⚡ You might struggle with</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {struggleCompanions.map((c) => (
                                            <Badge
                                                key={c.id}
                                                variant="struggle"
                                                className="flex items-center gap-1 text-lg px-4 py-2"
                                            >
                                                <span>{c.emoji}</span> {c.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Destination Image - 2:1 aspect ratio */}
                            <h4 className="text-bold text-2xl mt-4 mb-2">Next stop:</h4>
                            <div className="relative w-full h-[25%]">
                                <img
                                    src={heroImgSrc}
                                    alt={destination.name}
                                    className="h-full w-full object-cover brightness-90"
                                    crossOrigin="anonymous"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                                {/* Unsplash Attribution */}
                                {imageData && (
                                    <div className="absolute bottom-2 right-3 text-white text-xs opacity-80 z-20">
                                        Photo by {imageData.photographerName} on Unsplash
                                    </div>
                                )}

                                {/* Destination Info */}
                                <div className="absolute bottom-1.5 left-6 space-y-2 text-white z-10">
                                    <h2 className="text-styled text-4xl drop-shadow-md mb-0">
                                        {destination.name}
                                    </h2>
                                    {destination.location?.region && (
                                        <p className="text-xl text-white/90 drop-shadow-md">{destination.location.region}</p>
                                    )}
                                </div>
                            </div>

                            {/* Branding */}
                            <div className="text-center pt-4 border-t mt-auto">
                                <div className="flex justify-center">
                                    <QRCodeCanvas value={"https://saan-tayo-next.vercel.app/"} size={130} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-4">Find your next destination with bit.ly/SaanTayoNext</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Download button */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={handleExportImage}
                        disabled={isExporting || isGenerating || !generatedImage}
                        variant="default"
                        className="w-full"
                        size="md"
                    >
                        {isGenerating ? "Generating..." : isExporting ? "Downloading..." : "Download as image"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
