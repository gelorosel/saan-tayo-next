"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, pretty } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";
import { PersonalityProfile } from "@/src/types/personality";
import { personalities } from "@/src/data/personalities";
import { loadDescription, DescriptionData } from "@/lib/description";
import { prettyEnvironment, seasonLabels } from "@/lib/environment";
import { Button } from "./ui/button";
import { openGoogleSearch } from "@/lib/googleSearch";
import { toQueryName } from "@/lib/destination";
import { ShareResultModal } from "./ShareResultModal";

interface PersonalityResultCardProps {
    personality: PersonalityProfile;
    answers: Record<string, string>;
    destination: Destination;
    preferredActivity?: string;
    fastMode?: boolean;
    onBeenHere?: () => void;
}

const FALLBACK_IMAGE = "/images/default-img.jpeg";

interface UnsplashImageData {
    id?: string;
    url: string;
    photographerName: string;
    photographerUsername: string;
    photographerUrl: string;
    downloadLocation?: string;
}

async function fetchUnsplashImage(
    query: string,
    randomFromTop10: boolean = false
): Promise<UnsplashImageData | null> {
    try {
        const perPage = randomFromTop10 ? 10 : 1;
        const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&per_page=${perPage}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        if (randomFromTop10 && data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex] || null;
        }

        return data || null;
    } catch {
        return null;
    }
}

async function triggerDownload(downloadLocation: string | undefined) {
    if (!downloadLocation) return;

    try {
        await fetch(`/api/unsplash/download?download_location=${encodeURIComponent(downloadLocation)}`);
    } catch {
        // Silently fail - download tracking is not critical
    }
}

export function PersonalityResultCard({
    personality,
    answers,
    destination,
    preferredActivity,
    fastMode = false,
    onBeenHere,
}: PersonalityResultCardProps) {
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

    const activities = destination.activities;

    const reasons = useMemo(() => {
        const items: string[] = [];

        if (answers.environment && answers.environment !== "any") {
            items.push(`You wanted ${prettyEnvironment(answers.environment)}.`);
        }

        if (answers.season) {
            items.push(`Your timing fits the ${seasonLabels[answers.season] ?? "right season"}.`);
        }

        if (answers.island) {
            items.push(`It keeps you in ${answers.island.charAt(0).toUpperCase() + answers.island.slice(1)}.`);
        }

        return items.slice(0, 3);
    }, [answers.environment, answers.season, answers.island]);

    // Load image (skip if fast mode is enabled)
    useEffect(() => {
        if (fastMode) {
            setHeroImgSrc(FALLBACK_IMAGE);
            setIsLoadingImage(false);
            setIsFallbackImage(true);
            return;
        }

        let isStale = false;

        async function loadImage() {
            setIsLoadingImage(true);
            setImageData(null);
            setIsFallbackImage(false);

            let imageDataResult = await fetchUnsplashImage(destination.overrideUnsplashName || destination.name);
            let usedFallback = false;

            if (!imageDataResult && destination.environments?.length > 0) {
                const fallbackQuery = destination.island.toLowerCase() === "luzon"
                    ? `${destination.environments[0]} philippines`
                    : `${destination.island} ${destination.environments[0]} philippines`;
                usedFallback = true;
                imageDataResult = await fetchUnsplashImage(fallbackQuery, true);
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
            }
        }

        fetchDescription();

        return () => {
            isStale = true;
        };
    }, [destination.id, preferredActivity, personality?.id]);

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
                                <div className="h-9 w-40 bg-muted animate-pulse rounded mb-2" />
                                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end sm:max-w-[50%] items-center w-full mt-2 sm:mt-0">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Buttons Row */}
                    <div className="flex flex-row gap-6">
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
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                            </div>
                        </div>
                        <div className="h-6 w-32 bg-muted animate-pulse rounded-full" />
                    </div>

                    {/* Skeleton Personality Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Skeleton Companions */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
                            <div className="flex flex-wrap gap-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-7 w-32 bg-muted animate-pulse rounded-full" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="h-4 w-40 bg-muted animate-pulse rounded mb-2" />
                            <div className="flex flex-wrap gap-2">
                                <div className="h-7 w-32 bg-muted animate-pulse rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Why This Fits */}
                    <div>
                        <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-muted animate-pulse rounded" />
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
                            src={heroImgSrc}
                            alt={destination.name}
                            className={`absolute inset-0 h-full w-full object-cover ${isLoadingImage ? "opacity-70" : ""}`}
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
                        )}
                    </div>
                )}

                <CardContent className="p-8 space-y-4">
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-2 items-start sm:justify-between">
                            <div className="flex-1 min-w-[33%]">
                                <h2 className="text-styled text-3xl mt-2">{destination.name}</h2>
                                {destination.location?.region && (
                                    <p className="text-sm font-semibold mb-2">
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

                    <div className="flex flex-row gap-6">
                        <Button
                            onClick={() => setIsShareDialogOpen(true)}
                            variant="default"
                            size="md"
                            className="flex-1"
                        >
                            Share my results
                        </Button>
                        <Button
                            onClick={onBeenHere}
                            variant="outline"
                            size="md"
                            className="flex-1"
                        >
                            I&apos;ve been here!
                        </Button>
                    </div>

                    {/* Description */}
                    {isLoadingDescription ? (
                        <div className="text-sm">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        </div>
                    ) : description?.description ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {description.description}
                            </p>
                        </div>
                    ) : null}

                    {/* Personality Info Section */}
                    <p className="text-sm text-muted-foreground">Perfect for</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="flex items-end gap-4">
                                <div className="flex items-start gap-4">
                                    <p className="text-4xl">{personality.emoji}</p>
                                    <h3 className="text-styled text-2xl self-end">{personality.name}</h3>
                                </div>
                            </div>
                        </div>
                        <Badge variant={personality.category} className="capitalize text-sm">
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
                                            className="flex items-center gap-1 text-xs"
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
                                            className="flex items-center gap-1 text-xs"
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
                perfectCompanions={perfectCompanions}
                struggleCompanions={struggleCompanions}
            />
        </div>
    );
}