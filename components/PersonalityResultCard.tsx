"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";
import { PersonalityProfile } from "@/src/types/personality";
import { personalities } from "@/src/data/personalities";
import { pretty } from "@/src/data/activities";
import { loadDescription, DescriptionData } from "@/lib/description";
import { capitalize } from "@/lib/utils";
import { Button } from "./ui/button";
import { openGoogleSearch } from "@/lib/googleSearch";
import { toQueryName, getFallbackUnsplashQuery } from "@/lib/destination";
import { ShareResultModal } from "./ShareResultModal";
import { usePersonalitiesSidebar } from "@/contexts/PersonalitiesSidebarContext";
import { FALLBACK_IMAGE, fetchUnsplashImage, triggerDownload, UnsplashImageData } from "@/lib/unsplash";
import { isRateLimited } from "@/lib/rateLimit";

interface PersonalityResultCardProps {
    personality: PersonalityProfile;
    answers: Record<string, string>;
    destination: Destination & { score?: number; reasons?: string[] };
    preferredActivity?: string;
    fastMode?: boolean;
    onBeenHere?: () => void;
    onLoadingChange?: (isLoading: boolean) => void;
    onImageError?: () => void;
    onRateLimitReached?: () => void;
    destinationName?: string;
    currentIndex?: number;
    totalCount?: number;
}

export function PersonalityResultCard({
    personality,
    answers,
    destination,
    preferredActivity,
    fastMode = false,
    onBeenHere,
    onLoadingChange,
    onImageError,
    onRateLimitReached,
    destinationName,
    currentIndex,
    totalCount,
}: PersonalityResultCardProps) {
    const { openSidebar } = usePersonalitiesSidebar();

    // Memoized companion lists
    const perfectCompanions = useMemo(
        () => personality.compatibleWith
            .map((id) => personalities.find((p) => p.id === id))
            .filter(Boolean) as PersonalityProfile[],
        [personality.compatibleWith]
    );

    const struggleCompanions = useMemo(
        () => personality.avoidWith
            .map((id) => personalities.find((p) => p.id === id))
            .filter(Boolean) as PersonalityProfile[],
        [personality.avoidWith]
    );

    const [heroImgSrc, setHeroImgSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [imageData, setImageData] = useState<UnsplashImageData | null>(null);
    const [isFallbackImage, setIsFallbackImage] = useState(false);
    const [description, setDescription] = useState<DescriptionData | null>(null);
    const [isLoadingDescription, setIsLoadingDescription] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const imageLoadResolveRef = useRef<(() => void) | null>(null);

    const activities = destination.activities;
    const headerName = answers.name
        ? capitalize(answers.name).length > 12
            ? capitalize(answers.name).substring(0, 12) + '...'
            : capitalize(answers.name)
        : undefined;
    const reasons = destination.reasons || [];

    // Notify parent of loading state changes
    useEffect(() => {
        if (onLoadingChange) {
            onLoadingChange(isLoadingImage || isLoadingDescription);
        }
    }, [isLoadingImage, isLoadingDescription]);

    useEffect(() => {
        if (fastMode) {
            setHeroImgSrc(FALLBACK_IMAGE);
            setIsLoadingImage(false);
            setIsFallbackImage(true);
            setImageData(null);
            return;
        }

        let isStale = false;

        async function loadImage() {
            setIsLoadingImage(true);
            setImageData(null);
            setIsFallbackImage(false);

            const startTime = Date.now();

            try {
                let imageDataResult = await fetchUnsplashImage(destination.overrideUnsplashName || destination.name);
                let usedFallback = false;

                if (!imageDataResult) {
                    const fallbackQuery = getFallbackUnsplashQuery(destination);
                    usedFallback = true;
                    imageDataResult = await fetchUnsplashImage(fallbackQuery, true);
                }

                // Hardcoded delay for suspe
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 1500 - elapsedTime);
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                // Only update if this request hasn't been superseded
                if (!isStale) {
                    if (imageDataResult) {
                        // Proxy the image through our API for iOS compatibility
                        const proxiedUrl = `/api/unsplash/image?url=${encodeURIComponent(imageDataResult.url)}`;
                        setHeroImgSrc(proxiedUrl);
                        setImageData(imageDataResult);
                        setIsFallbackImage(usedFallback);
                        triggerDownload(imageDataResult.downloadLocation);
                    } else {
                        setHeroImgSrc(FALLBACK_IMAGE);
                        setIsFallbackImage(true);
                    }
                    setIsLoadingImage(false);
                    
                    // Resolve any pending promise waiting for image to load
                    // Use setTimeout to ensure state updates have been flushed
                    setTimeout(() => {
                        if (imageLoadResolveRef.current) {
                            imageLoadResolveRef.current();
                            imageLoadResolveRef.current = null;
                        }
                    }, 0);
                }
            } catch (error) {
                console.error('Error loading image:', error);
                // API/Network error occurred
                if (!isStale) {
                    setHeroImgSrc(FALLBACK_IMAGE);
                    setIsFallbackImage(true);
                    setIsLoadingImage(false);
                    
                    // Resolve any pending promise even on error
                    setTimeout(() => {
                        if (imageLoadResolveRef.current) {
                            imageLoadResolveRef.current();
                            imageLoadResolveRef.current = null;
                        }
                    }, 0);
                    
                    // Notify parent component about the error
                    if (onImageError) {
                        onImageError();
                    }
                }
            }
        }

        loadImage();

        return () => {
            isStale = true;
        };
    }, [destination.id, fastMode]);

    // Load description
    useEffect(() => {
        let isStale = false;

        async function fetchDescription() {
            // Skip rate limit check if fast mode is enabled (descriptions aren't loading anyway)
            if (fastMode) {
                setIsLoadingDescription(false);
                setDescription(null);
                return;
            }

            // Check rate limit before starting
            if (isRateLimited()) {
                if (onRateLimitReached) {
                    onRateLimitReached();
                }
                setIsLoadingDescription(false);
                setDescription(null);
                return;
            }

            setIsLoadingDescription(true);
            setDescription(null);

            const descriptionData = await loadDescription({
                destination,
                preferredActivity,
                activities,
                personalityId: personality?.id,
            });

            // Only update if this request hasn't been superseded
            if (!isStale) {
                setDescription(descriptionData);
                setIsLoadingDescription(false);

                // Check if rate limit was hit during the fetch
                if (!descriptionData && isRateLimited()) {
                    if (onRateLimitReached) {
                        onRateLimitReached();
                    }
                }
            }
        }

        fetchDescription();

        return () => {
            isStale = true;
        };
    }, [destination.id, preferredActivity, personality?.id, fastMode]);

    // Handler for opening share dialog - waits for image to load
    const handleShareResults = async () => {
        // If image is still loading and not in fast mode, wait for it to complete
        if (isLoadingImage && !fastMode) {
            await new Promise<void>((resolve) => {
                imageLoadResolveRef.current = resolve;
            });
        }
        
        // Additional safety check: ensure we have a valid image source
        if (!heroImgSrc || heroImgSrc === FALLBACK_IMAGE) {
            console.warn('Opening share dialog with fallback image');
        }
        
        setIsShareDialogOpen(true);
    };

    // Skeleton loading state
    if (!fastMode && (isLoadingImage || isLoadingDescription)) {
        return (
            <Card className="overflow-hidden rounded-2xl shadow-sm w-full">
                {/* Skeleton Image */}
                <div className="relative w-full aspect-[16/9] bg-muted animate-pulse">
                    <p className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-muted-foreground z-10">
                        Taking you to your next destination...
                    </p>
                </div>

                <CardContent className="p-8 space-y-4">
                    {/* Skeleton Header */}
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-2 items-start sm:justify-between">
                            <div className="flex-1 min-w-[33%]">
                                {headerName && (
                                    <div className="h-4 w-48 bg-muted animate-pulse rounded mb-4" />
                                )}
                                <div className="h-9 w-40 bg-muted animate-pulse rounded mb-2 mt-2" />
                                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end sm:max-w-[50%] items-center w-full mt-2 sm:mt-0">
                                {[16, 28, 16, 20, 16].map((x, i) => (
                                    <div key={i} className={`h-7 w-${x} bg-muted animate-pulse rounded-full`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Buttons Row */}
                    <div className="flex flex-row gap-4">
                        <div className="h-12 flex-1 bg-muted animate-pulse rounded-md" />
                        <div className="h-12 flex-1 bg-muted animate-pulse rounded-md" />
                    </div>

                    {/* Skeleton Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Skeleton "Perfect for" label */}
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />

                    {/* Skeleton Personality Section */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="flex items-end gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                                    <div className="h-8 w-48 bg-muted animate-pulse rounded self-end" />
                                </div>
                            </div>
                        </div>
                        <div className="h-7 w-32 bg-muted animate-pulse rounded-full" />
                    </div>

                    {/* Skeleton Personality Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Skeleton Companions */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1" />
                            <div className="flex flex-wrap gap-2 mt-1">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-8 w-40 bg-muted animate-pulse rounded-full" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="h-4 w-44 bg-muted animate-pulse rounded mb-1" />
                            <div className="flex flex-wrap gap-2 mt-1">
                                <div className="h-8 w-40 bg-muted animate-pulse rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Why This Fits */}
                    <div>
                        <div className="h-4 w-28 bg-muted animate-pulse rounded mb-2" />
                        <div className="space-y-1">
                            <div className="h-4 w-full bg-muted animate-pulse rounded" />
                            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
                        </div>
                    </div>

                    {/* Skeleton Best months */}
                    <div className="space-y-2">
                        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Skeleton "Know more" Button */}
                    <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="relative">
            <Card className="overflow-hidden rounded-2xl shadow-sm w-full">
                {/* Destination Image */}
                {!fastMode && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <img
                            src={destination.overrideImageUrl || heroImgSrc}
                            alt={destination.name}
                            id={imageData?.id}
                            width={800}
                            height={450}
                            loading="eager"
                            decoding="async"
                            className={`absolute inset-0 h-full w-full object-cover ${isLoadingImage ? "opacity-70" : ""}`}
                            crossOrigin="anonymous"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        {/* Unsplash Attribution */}
                        {imageData && (
                            <>
                                {
                                    destination.overrideImageAttribution ? (
                                        <div className="absolute bottom-2 right-3 text-white text-xs opacity-80 z-20 cursor-default select-none">
                                            {destination.overrideImageAttribution}
                                        </div>
                                    ) : (
                                        <>
                                            {isFallbackImage && (
                                                <div className="absolute bottom-6 right-3 text-white text-xs opacity-70 z-20 cursor-default select-none">
                                                    (may not be the actual destination)
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 right-3 text-white text-xs opacity-80 hover:opacity-100 transition-opacity z-20">
                                                <a
                                                    href={imageData.photographerUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    Photo by {imageData.photographerName}
                                                </a>
                                                {" on "}
                                                <a
                                                    href="https://unsplash.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    Unsplash
                                                </a>
                                            </div>
                                        </>
                                    )
                                }
                            </>
                        )}
                    </div>
                )}

                <CardContent className="p-8 space-y-4">
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-2 items-start sm:justify-between">
                            <div className="flex-1 min-w-[33%]">
                                {headerName && (
                                    <p className="text-sm font-semibold mb-4">
                                        {headerName}, your next destination is
                                    </p>
                                )}
                                <h2 className="text-styled text-3xl mt-2">{destinationName || destination.name}</h2>
                                {destination.location?.region && (
                                    <p className="text-sm text-muted-foreground">
                                        {destination.location.region}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end sm:max-w-[50%] items-center w-full mt-2 sm:mt-0">
                                {[...new Set(activities)].sort().map((a) => (
                                    <Badge key={a} variant="outline">
                                        {pretty(a)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row gap-4">
                        <Button
                            onClick={handleShareResults}
                            variant="default"
                            size="md"
                            className="flex-1"
                        >
                            Share my results
                        </Button>
                        {currentIndex !== undefined && totalCount !== undefined && currentIndex >= totalCount - 1 ? (
                            <Button
                                variant="outline"
                                size="md"
                                className="flex-1"
                                disabled
                            >
                                <div className="flex flex-col items-center justify-center">
                                    You've reached the end! 🎉
                                </div>
                            </Button>
                        ) : (
                            <Button
                                onClick={onBeenHere}
                                variant="outline"
                                size="md"
                                className="flex-1"
                            >
                                I&apos;ve been here!
                            </Button>
                        )}
                    </div>

                    {/* Description */}
                    {isLoadingDescription ? (
                        <div className="text-sm">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        </div>
                    ) : description?.description ? (
                        <>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {description.description}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">Perfect for</p>
                        </>
                    ) : null}

                    {/* Personality Info Section */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="flex items-end gap-4">
                                <div className="flex items-start gap-4">
                                    <p className="text-4xl">{personality.emoji}</p>
                                    <h3 className="text-styled text-2xl self-end">{personality.name}</h3>
                                </div>
                            </div>
                        </div>
                        <Badge variant={personality.category} className="capitalize text-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openSidebar(personality)}>
                            {personality.category} traveler
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {personality.description}
                    </p>

                    {/* Companions */}
                    <div className="flex flex-col gap-3 text-slate-800">
                        {perfectCompanions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium">🤝 Ideal travel companions</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {perfectCompanions.map((c) => (
                                        <Badge
                                            key={c.id}
                                            variant="ideal"
                                            className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openSidebar(c)}
                                        >
                                            <span>{c.emoji}</span> {c.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {struggleCompanions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium">⚡ You might struggle with</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {struggleCompanions.map((c) => (
                                        <Badge
                                            key={c.id}
                                            variant="struggle"
                                            className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openSidebar(c)}
                                        >
                                            <span>{c.emoji}</span> {c.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {reasons && reasons.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Why this fits</h3>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-2">
                        {description?.bestMonths && (
                            <p className="text-sm">
                                Best months to visit: {description.bestMonths}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={() => openGoogleSearch(toQueryName(destination))}
                        variant="outline"
                        className="w-full"
                        size="md"
                    >
                        Know more about {destination.name}
                    </Button>
                </CardContent>
            </Card>

            {/* Share Dialog */}
            <ShareResultModal
                isOpen={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                personality={personality}
                destination={destination}
                heroImgSrc={heroImgSrc}
                imageData={imageData}
                isFallbackImage={isFallbackImage}
                headerName={headerName}
                perfectCompanions={perfectCompanions}
                struggleCompanions={struggleCompanions}
            />
        </div>
    );
}