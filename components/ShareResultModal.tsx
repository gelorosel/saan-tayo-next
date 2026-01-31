"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { QRCodeSVG } from "qrcode.react";
import { convertImageToDataUrl } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

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
    const [isImageReady, setIsImageReady] = useState(false);
    const [dataUrlImage, setDataUrlImage] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const generateImage = async () => {
        if (!exportRef.current) {
            console.error('exportRef.current is null!');
            return;
        }

        if (!dataUrlImage) {
            console.error('dataUrlImage is null, cannot generate image!');
            return;
        }

        try {
            setIsGenerating(true);

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

            // Extra wait to ensure everything is painted (longer for iOS)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            await new Promise(resolve => setTimeout(resolve, isIOS ? 500 : 300));

            const dataUrl = await toPng(exportRef.current, {
                quality: 0.95,
                pixelRatio: isIOS ? 1.5 : 2, // Lower pixel ratio for iOS to prevent memory issues
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: 600,
                skipFonts: false,
            });

            setGeneratedImage(dataUrl);
        } catch (error) {
            console.error("Error generating image:", error);
            alert('Failed to generate image! Please try again.');
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

    const handleCopyLink = async () => {
        try {
            const url = "https://saan-tayo-next.gelorosel.com/";
            await navigator.clipboard.writeText(url);
            setIsCopied(true);

            // Reset the "Copied!" text after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Error copying link:", error);
            // Fallback for older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = "https://saan-tayo-next.gelorosel.com/";
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            } catch (fallbackError) {
                console.error("Fallback copy failed:", fallbackError);
                alert("Failed to copy link. Please copy manually: " + "bit.ly/SaanTayoNext");
            }
        }
    };

    // In order forhtml-to-image to capture the entire DOM element
    // It needs to serialize all content (HTML, CSS, images) into an image
    // Problem: External image URLs can fail during this process, especially on iOS
    // Solution: Convert image to data URL first so it's embedded directly in the DOM
    useEffect(() => {
        if (isOpen && heroImgSrc) {
            setDataUrlImage(null);
            setGeneratedImage(null);
            setIsImageReady(false);

            const loadImageAsDataUrl = async () => {
                let attempts = 0;
                const maxAttempts = 3;

                while (attempts < maxAttempts) {
                    try {
                        // Add delay to ensure DOM has settled and image is fully loaded
                        if (attempts === 0) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }

                        // Convert the image to data URL for better compatibility with html-to-image
                        const dataUrl = await convertImageToDataUrl(destination.overrideImageUrl || heroImgSrc);
                        setDataUrlImage(dataUrl);
                        setIsImageReady(true);
                        console.log('Successfully converted image to data URL');
                        return;
                    } catch (error) {
                        attempts++;
                        console.error(`Failed to convert image to data URL (attempt ${attempts}/${maxAttempts}):`, error);

                        if (attempts < maxAttempts) {
                            // Wait before retrying (exponential backoff)
                            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
                        }
                    }
                }

                // After all retries failed, fall back to using the original URL
                console.warn('All conversion attempts failed, using original URL');
                setDataUrlImage(heroImgSrc);
                setIsImageReady(true);
            };

            loadImageAsDataUrl();
        }
    }, [isOpen, heroImgSrc, destination.overrideImageUrl]);

    // Generate image when data URL is ready
    useEffect(() => {
        if (isOpen && dataUrlImage) {
            // Delay to ensure the dialog and hidden element are fully rendered
            const timer = setTimeout(() => {
                console.log('Starting image generation with dataUrlImage:', dataUrlImage?.substring(0, 50));
                generateImage();
            }, 150); // Slightly longer delay for iOS
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, dataUrlImage]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={`max-w-[500px] h-full sm:h-[95vh] overflow-y-auto bg-background ${!generatedImage || isGenerating ? 'p-0 m-0' : 'p-4'}`}>
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>

                {/* Display generated image or loading state */}
                {!isImageReady || isGenerating ? (
                    <div className="w-full aspect-[1/2] flex items-center justify-center bg-muted rounded-lg p-0 m-0">
                        <p className="text-muted-foreground">
                            {!isImageReady ? 'Loading image...' : 'Generating preview...'}
                        </p>
                    </div>
                ) : generatedImage ? (
                    <div className="w-full">
                        <img
                            src={generatedImage}
                            alt="Share preview"
                            width={600}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                ) : <div className="w-full aspect-[1/2] flex items-center justify-center bg-muted rounded-lg p-0 m-0">
                    <p className="text-muted-foreground">
                        {'Generating preview...'}
                    </p>
                </div>}

                {/* Hidden export version for generation - always rendered */}
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
                        width: generatedImage ? '0px' : '600px',
                    }}
                >
                    <Card className="border-none overflow-hidden rounded-2xl shadow-sm" style={{ width: '600px' }}>
                        <CardContent className="p-0" style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Header Statement */}
                            <h1 className="mt-12 mb-4 text-center text-styled text-5xl" style={{ flexShrink: 0 }}>Saan Tayo Next?</h1>
                            <div className="p-0" style={{ height: '270px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: '0 0 270px', display: 'flex', flexDirection: 'column' }}>
                                    <div className="relative" style={{ width: '600px', height: '270px', overflow: 'hidden' }}>
                                        {dataUrlImage && <img
                                            src={dataUrlImage}
                                            alt={destination.name}
                                            loading="eager"
                                            decoding="async"
                                            style={{
                                                width: '600px',
                                                height: '270px',
                                                objectFit: 'cover',
                                                objectPosition: 'center'
                                            }}
                                            className="brightness-90"
                                            crossOrigin="anonymous"
                                        />}
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                                        {/* Unsplash Attribution */}
                                        {imageData && (
                                            <>
                                                {
                                                    destination.overrideImageAttribution ? (
                                                        <div className="absolute bottom-2 right-3 text-white text-xs opacity-80 z-20">
                                                            {destination.overrideImageAttribution}
                                                        </div>
                                                    ) : (
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
                                                    )
                                                }
                                            </>
                                        )}

                                        {/* Destination Info */}
                                        <div className="absolute bottom-1.5 left-6 space-y-2 text-white z-10">
                                            <h2 className="text-styled text-4xl drop-shadow-md mb-0 !text-white">
                                                {destination.name}
                                            </h2>
                                            {destination.location?.region && (
                                                <p className="text-xl text-white/90 drop-shadow-md">{destination.location.region}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-6 space-y-4" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="mt-2" style={{ flexShrink: 0 }}>
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

                                <p className="text-lg leading-relaxed" style={{ flexShrink: 0 }}>
                                    {personality.description}
                                </p>

                                {/* Companions */}
                                {perfectCompanions.length > 0 && (
                                    <div style={{ flexShrink: 0 }}>
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
                                    <div style={{ flexShrink: 0 }}>
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
                                <div className="text-center pt-4 border-t" style={{ flexShrink: 0 }}>
                                    <div className="flex flex-row gap-4 justify-center">
                                        {/* QR code */}
                                        <QRCodeSVG value={"saan-tayo-next.gelorosel.com"} size={125} />
                                        <div className="text-left my-auto">
                                            <p className="text-sm mt-2">Find your next destination at</p>
                                            <p className="text-md mt-2"><b className="text-primary">bit.ly/SaanTayoNext</b></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Action buttons */}
                {!generatedImage || isGenerating ? null : <div className="mt-auto">
                    <p className="text-xs mb-0 text-muted-foreground">Share this link with your friends!</p>
                    <div className="flex flex-row gap-3 mt-0">
                        {/* Copy Link Field */}
                        <div className="flex flex-col mt-auto w-[63%]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={"saan-tayo-next.gelorosel.com"}
                                    readOnly
                                    className="min-h-[46px] w-full px-2 py-2 pr-12 text-sm border border-input rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer font-mono text-blue-500 underline"
                                    onClick={handleCopyLink}
                                />
                                <button
                                    onClick={handleCopyLink}
                                    disabled={isGenerating || !generatedImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Copy link"
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportImage}
                            disabled={isExporting || isGenerating || !generatedImage}
                            variant="outline"
                            className="w-[37%]"
                            size="md"
                        >
                            {!isImageReady ? "Loading..." : isGenerating ? "Generating..." : isExporting ? "Downloading..." : "Download"}
                        </Button>
                    </div>
                </div>}
            </DialogContent>
        </Dialog >
    );
}
