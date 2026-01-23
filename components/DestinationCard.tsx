"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";
import { openGoogleSearch, toQueryName } from "@/lib/destination";

type Props = {
    destination: Destination;
    /** Optional: show only relevant activities */
    activitiesOverride?: Destination["activities"];
    /** Preferred activity from user's preferences */
    preferredActivity?: string;
};

const pretty = (v: string) =>
    v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519046904884-53103b34b206";

interface UnsplashImageData {
    id?: string;
    url: string;
    photographerName: string;
    photographerUsername: string;
    photographerUrl: string;
    downloadLocation?: string;
}

async function fetchUnsplashImage(query: string, randomFromTop10: boolean = false): Promise<UnsplashImageData | null> {
    try {
        const perPage = randomFromTop10 ? 10 : 1;
        const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&per_page=${perPage}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        if (randomFromTop10 && data.results && data.results.length > 0) {
            // Randomly pick one from the top 10 results
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex] || null;
        }

        return data || null;
    } catch (error) {
        return null;
    }
}

async function triggerDownload(downloadLocation: string | undefined) {
    if (!downloadLocation) return;

    try {
        await fetch(`/api/unsplash/download?download_location=${encodeURIComponent(downloadLocation)}`);
    } catch (error) {
        // Silently fail - download tracking is not critical
    }
}

interface WikiDescription {
    query: string;
    title: string | null;
    description: string | null;
    url: string | null;
}

interface DescriptionData {
    description: string;
    source: 'gemini' | 'wiki';
}

export default function DestinationResultCard({
    destination,
    activitiesOverride,
    preferredActivity,
}: Props) {
    const [heroImgSrc, setHeroImgSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [isLoadingDescription, setIsLoadingDescription] = useState(false);
    const [isFallbackImage, setIsFallbackImage] = useState(false);
    const [imageData, setImageData] = useState<UnsplashImageData | null>(null);
    const [description, setDescription] = useState<DescriptionData | null>(null);
    const activities = activitiesOverride ?? destination.activities;

    useEffect(() => {
        let isMounted = true;

        async function loadImage() {
            setIsLoadingImage(true);
            setImageData(null);

            // Check fast mode
            let fastMode = false;
            try {
                const configResponse = await fetch('/api/config');
                if (configResponse.ok) {
                    const config = await configResponse.json();
                    fastMode = config.fastMode || false;
                }
            } catch (error) {
                // Silently fail
            }

            if (fastMode) {
                // Fast mode: use fallback image immediately
                if (isMounted) {
                    setHeroImgSrc(FALLBACK_IMAGE);
                    setIsFallbackImage(true);
                    setIsLoadingImage(false);
                }
                return;
            }

            // First try: query by destination name
            let imageDataResult = await fetchUnsplashImage(destination.overrideUnsplashName || destination.name);

            // Fallback: query by environment + philippines (random from top 10)
            if (!imageDataResult && destination.environments && destination.environments.length > 0) {
                const fallbackQuery = `${destination.environments[0]} philippines`;
                setIsFallbackImage(true);
                imageDataResult = await fetchUnsplashImage(fallbackQuery, true);
            }

            if (isMounted) {
                if (imageDataResult) {
                    setHeroImgSrc(imageDataResult.url);
                    setImageData(imageDataResult);
                    // Trigger download when image is loaded
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
            isMounted = false;
        };
    }, [destination]);

    useEffect(() => {
        let isMounted = true;

        async function loadDescription() {
            setIsLoadingDescription(true);
            setDescription(null);

            // Get configuration
            let prioritizeGemini = false;
            let fastMode = false;
            try {
                const configResponse = await fetch('/api/config');
                if (configResponse.ok) {
                    const config = await configResponse.json();
                    prioritizeGemini = config.prioritizeGemini || false;
                    fastMode = config.fastMode || false;
                }
            } catch (error) {
                // Silently fail
            }

            // Fast mode: skip description fetching
            if (fastMode) {
                if (isMounted) {
                    setIsLoadingDescription(false);
                }
                return;
            }

            const queryName = toQueryName(destination);

            if (prioritizeGemini) {
                // Try Gemini first
                try {
                    const activityParam = preferredActivity || activities[0] || 'travel';
                    const geminiResponse = await fetch(`/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
                    if (geminiResponse.ok) {
                        const geminiData = await geminiResponse.json();
                        if (geminiData.description && isMounted) {
                            setDescription({
                                description: geminiData.description,
                                source: 'gemini'
                            });
                            setIsLoadingDescription(false);
                            return;
                        }
                    }
                } catch (error) {
                    // Silently fail - will fallback to Wiki
                }

                // Fallback to Wiki if Gemini fails
                try {
                    const activityParam = preferredActivity || activities[0] || 'travel';
                    const wikiResponse = await fetch(`/api/wiki?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
                    if (wikiResponse.ok) {
                        const wikiData = await wikiResponse.json();
                        if (wikiData.description && isMounted) {
                            setDescription({
                                description: wikiData.description,
                                source: 'wiki'
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching wiki description:", error);
                }
            } else {
                // Try Wiki first
                try {
                    const activityParam = preferredActivity || activities[0] || 'travel';
                    const wikiResponse = await fetch(`/api/wiki?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
                    if (wikiResponse.ok) {
                        const wikiData = await wikiResponse.json();
                        if (wikiData.description && isMounted) {
                            setDescription({
                                description: wikiData.description,
                                source: 'wiki'
                            });
                            setIsLoadingDescription(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching wiki description:", error);
                }

                // Fallback to Gemini if Wiki fails
                try {
                    const activityParam = preferredActivity || activities[0] || 'travel';
                    const geminiResponse = await fetch(`/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
                    if (geminiResponse.ok) {
                        const geminiData = await geminiResponse.json();
                        if (geminiData.description && isMounted) {
                            setDescription({
                                description: geminiData.description,
                                source: 'gemini'
                            });
                        }
                    }
                } catch (error) {
                    // Silently fail - will fallback to Wiki
                }
            }

            if (isMounted) {
                setIsLoadingDescription(false);
            }
        }

        loadDescription();

        return () => {
            isMounted = false;
        };
    }, [destination, preferredActivity, activities]);

    const handleGoogleSearch = () => {
        openGoogleSearch(destination);
    };

    if (isLoadingImage || isLoadingDescription) {
        return (
            <Card className="overflow-hidden rounded-2xl shadow-sm pt-0">
                <div className="relative h-72 w-full bg-muted" />
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Looking for your next destination...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden rounded-2xl shadow-sm pt-0">
            {/* hero image */}
            <div className="relative h-72 w-full">
                {isLoadingImage ? (
                    <div className="h-full w-full bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3 animate-shimmer" />
                    </div>
                ) : (
                    <img
                        src={heroImgSrc}
                        alt={`${destination.name}`}
                        className="h-full w-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Unsplash Attribution */}
                {imageData && (
                    <>
                        {isFallbackImage && <div className="absolute bottom-2 left-2 text-white text-xs opacity-50 hover:opacity-100 transition-opacity">
                            (may not be the actual destination)
                        </div>}
                        <div className="absolute bottom-2 right-2 text-white text-xs opacity-80 hover:opacity-100 transition-opacity">
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

            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-semibold">{destination.name}</h2>
                    <p className="text-muted-foreground">
                        {destination.location?.region
                            ? `${destination.location.region}`
                            : ""}
                    </p>
                </div>

                {/* Activities */}
                <div className="flex flex-wrap gap-2">
                    {[...new Set(activities)].sort().map((a) => (
                        <Badge key={a} variant="outline" className="px-3 py-1">
                            {pretty(a)}
                        </Badge>
                    ))}
                </div>

                {/* Description */}
                {isLoadingDescription ? (
                    <div className="text-sm text-muted-foreground">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                    </div>
                ) : description?.description ? (
                    <p className="text-sm text-muted-foreground">
                        {description.description}
                    </p>
                ) : null}

                {/* Google Search Button */}
                <Button
                    onClick={handleGoogleSearch}
                    variant="outline"
                    className="w-full"
                >
                    Know more about {destination.name}
                </Button>
            </CardContent>
        </Card>
    );
}
