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
    isFallbackImage: boolean;
    headerName?: string;
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
    isFallbackImage,
    headerName,
    perfectCompanions,
    struggleCompanions,
}: ShareResultModalProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [dataUrlImage, setDataUrlImage] = useState<string | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    const convertImageToDataUrl = async (imageUrl: string, retries = 3): Promise<string> => {
        return new Promise((resolve, reject) => {
            const attemptLoad = (attemptsLeft: number) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                // Add timeout for iOS Safari
                const timeout = setTimeout(() => {
                    if (attemptsLeft > 0) {
                        console.log(`Image load timeout, retrying... (${attemptsLeft} attempts left)`);
                        attemptLoad(attemptsLeft - 1);
                    } else {
                        reject(new Error('Image load timeout'));
                    }
                }, 10000); // 10 second timeout

                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/jpeg', 0.95));
                        } else {
                            reject(new Error('Failed to get canvas context'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => {
                    clearTimeout(timeout);
                    if (attemptsLeft > 0) {
                        console.log(`Image load failed, retrying... (${attemptsLeft} attempts left)`);
                        setTimeout(() => attemptLoad(attemptsLeft - 1), 500);
                    } else {
                        reject(new Error('Failed to load image after multiple attempts'));
                    }
                };

                img.src = imageUrl;
            };

            attemptLoad(retries);
        });
    };

    const generateImage = async () => {
        if (!exportRef.current) {
            console.error('exportRef.current is null!');
            return;
        }

        try {
            setIsGenerating(true);

            // Wait for the element to be in the DOM
            await new Promise(resolve => setTimeout(resolve, 200));

            // Wait for all images to load with longer timeout for iOS
            const images = exportRef.current.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map((img) => {
                    if (img.complete && img.naturalHeight !== 0) {
                        return Promise.resolve();
                    }
                    return new Promise((resolve) => {
                        const timeout = setTimeout(() => {
                            console.warn('Image load timeout, continuing anyway');
                            resolve(null);
                        }, 15000); // 15 second timeout for iOS

                        img.onload = () => {
                            clearTimeout(timeout);
                            resolve(null);
                        };
                        img.onerror = () => {
                            clearTimeout(timeout);
                            console.warn('Image failed to load, continuing anyway');
                            resolve(null);
                        };
                    });
                })
            );

            // Wait for QR code canvas to render
            const qrCanvas = exportRef.current.querySelector('canvas');
            if (qrCanvas) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Extra wait to ensure everything is painted (longer for iOS)
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Attempting to generate image...');
            const dataUrl = await toPng(exportRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: 600,
                height: 1113,
                skipFonts: false,
            });

            setGeneratedImage(dataUrl);
            console.log('Image generated successfully!');
        } catch (error) {
            console.error("Error generating image:", error);
            alert('Failed to generate image. Please try again. Check console for details.');
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

    // Convert hero image to data URL when modal opens
    useEffect(() => {
        if (isOpen && heroImgSrc) {
            setDataUrlImage(null);
            setGeneratedImage(null);

            const loadImageAsDataUrl = async () => {
                try {
                    console.log('Converting image to data URL for iOS compatibility...');
                    // Convert the image to data URL for better compatibility with html-to-image
                    const dataUrl = await convertImageToDataUrl(heroImgSrc, 3);
                    setDataUrlImage(dataUrl);
                    console.log('Image converted successfully');
                } catch (error) {
                    console.error('Failed to convert image to data URL:', error);
                    // Fall back to using the original URL
                    console.log('Falling back to original URL');
                    setDataUrlImage(heroImgSrc);
                }
            };

            loadImageAsDataUrl();
        }
    }, [isOpen, heroImgSrc]);

    // Generate image when data URL is ready
    useEffect(() => {
        if (isOpen && dataUrlImage) {
            // Longer delay for iOS to ensure the dialog and hidden element are fully rendered
            const timer = setTimeout(() => {
                console.log('Starting image generation process...');
                generateImage();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, dataUrlImage]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] h-full sm:h-[95vh] overflow-y-auto p-4">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>

                {/* Display generated image or loading state */}
                {!dataUrlImage || isGenerating ? (
                    <div className="w-full aspect-[1/2] flex items-center justify-center bg-muted rounded-lg">
                        <p className="text-muted-foreground">
                            {!dataUrlImage ? 'Loading image...' : 'Generating preview...'}
                        </p>
                    </div>
                ) : generatedImage ? (
                    <div className="w-full">
                        <img
                            src={generatedImage}
                            alt="Share preview"
                            width={600}
                            height={1113}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                ) : null}

                {/* Hidden export version for generation - 9:16 aspect ratio - always rendered */}
                <div
                    ref={exportRef}
                    className="pointer-events-none bg-white overflow-hidden"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: -999,
                        opacity: isGenerating ? 1 : 0.01,
                        visibility: generatedImage ? 'hidden' : 'visible',
                        height: generatedImage ? '0px' : '1113px',
                        width: generatedImage ? '0px' : '600px',
                    }}
                >
                    <Card className="overflow-hidden rounded-2xl shadow-sm w-full h-full">
                        <CardContent className="p-0 h-full flex flex-col">
                            {/* Header Statement */}
                            <h1 className="mt-12 mb-4 text-center text-styled text-5xl flex-shrink-0">Saan Tayo Next?</h1>
                            <div className="p-0 h-full flex flex-col min-h-0">
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="relative w-full flex-1 min-h-0 max-h-[33vh]">
                                        <img
                                            src={dataUrlImage || heroImgSrc}
                                            alt={destination.name}
                                            width={800}
                                            height={450}
                                            loading="eager"
                                            decoding="async"
                                            className="h-full w-full object-cover brightness-90"
                                            crossOrigin="anonymous"
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                                        {/* Unsplash Attribution */}
                                        {imageData && (
                                            <>
                                                {isFallbackImage && (
                                                    <div className="absolute bottom-6 right-3 text-white text-xs opacity-70 z-20">
                                                        (may not be the actual destination)
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-3 text-white text-xs opacity-80 z-20">
                                                    Photo by {imageData.photographerName} on Unsplash
                                                </div>
                                            </>

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
                                </div>
                            </div>
                            <div className="px-10 pt-10 space-y-4 h-full flex flex-col mb-0 pb-0">
                                <div className="mt-2 flex-shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-end gap-4">
                                            <div className="flex items-start gap-4">
                                                <p className="text-6xl">{personality.emoji}</p>
                                                <h2 className="text-4xl font-bold">{headerName ? `${headerName} is ` : "I'm "}{personality.name}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={personality.category} className="capitalize text-xl px-4 py-2 mt-2">
                                        {personality.category} traveler
                                    </Badge>
                                </div>

                                <p className="text-lg leading-relaxed flex-shrink-0">
                                    {personality.description}
                                </p>

                                {/* Companions */}
                                {perfectCompanions.length > 0 && (
                                    <div className="flex-shrink-0">
                                        <h4 className="text-lg font-medium">🤝 Ideal travel companions</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {perfectCompanions.map((c) => (
                                                <Badge
                                                    key={c.id}
                                                    variant="ideal"
                                                    className="flex items-center gap-1 text-lg px-2 py-2"
                                                >
                                                    <span>{c.emoji}</span> {c.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {struggleCompanions.length > 0 && (
                                    <div className="flex-shrink-0">
                                        <h4 className="text-lg font-medium">⚡ You might struggle with</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {struggleCompanions.map((c) => (
                                                <Badge
                                                    key={c.id}
                                                    variant="struggle"
                                                    className="flex items-center gap-1 text-lg px-2 py-2"
                                                >
                                                    <span>{c.emoji}</span> {c.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Branding */}
                                <div className="text-center pt-6 border-t flex-shrink-0 mb-8">
                                    <div className="flex justify-center">
                                        {/* QR code */}
                                        <QRCodeCanvas value={"https://saan-tayo-next.vercel.app/"} size={100} />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">Find your next destination with bit.ly/SaanTayoNext</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Download button */}
                <div className="flex gap-2 mt-auto">
                    <Button
                        onClick={handleExportImage}
                        disabled={isExporting || isGenerating || !generatedImage || !dataUrlImage}
                        variant="outline"
                        className="w-full"
                        size="md"
                    >
                        {!dataUrlImage ? "Loading..." : isGenerating ? "Generating..." : isExporting ? "Downloading..." : "Download"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}