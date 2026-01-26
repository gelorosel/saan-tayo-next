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

interface PersonalityResultCardProps {
    personality: PersonalityProfile;
    answers: Record<string, string>;
    destination: Destination;
    preferredActivity?: string;
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
}: PersonalityResultCardProps) {
    // Map companion IDs to actual names/emojis
    const perfectCompanions = personality.compatibleWith
        .map((id) => personalities.find((p) => p.id === id))
        .filter(Boolean) as PersonalityProfile[];

    const struggleCompanions = personality.avoidWith
        .map((id) => personalities.find((p) => p.id === id))
        .filter(Boolean) as PersonalityProfile[];

    const [heroImgSrc, setHeroImgSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [imageData, setImageData] = useState<UnsplashImageData | null>(null);
    const [isFallbackImage, setIsFallbackImage] = useState(false);
    const [fastModeVersion, setFastModeVersion] = useState(0);
    const [description, setDescription] = useState<DescriptionData | null>(null);
    const [isLoadingDescription, setIsLoadingDescription] = useState(false);

    const activities = destination.activities;

    const reasons = useMemo(() => {
        if (!destination) return [];

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
    }, [
        answers,
        destination,
    ]);

    const handleGoogleSearch = () => {
        openGoogleSearch(toQueryName(destination));
    };

    useEffect(() => {
        let isMounted = true;

        const checkFastMode = (): boolean => {
            try {
                const saved = localStorage.getItem("fastMode");
                if (saved !== null) {
                    return saved === "true";
                }
            } catch {
                // Silently fail
            }
            return false;
        };

        async function loadImage() {
            setIsLoadingImage(true);
            setImageData(null);

            let fastMode = checkFastMode();
            if (!fastMode) {
                try {
                    const configResponse = await fetch("/api/config");
                    if (configResponse.ok) {
                        const config = await configResponse.json();
                        fastMode = config.fastMode || false;
                    }
                } catch {
                    // Silently fail
                }
            }

            if (fastMode) {
                if (isMounted) {
                    setHeroImgSrc(FALLBACK_IMAGE);
                    setIsLoadingImage(false);
                    setIsFallbackImage(true);
                }
                return;
            }

            let imageDataResult = await fetchUnsplashImage(destination.overrideUnsplashName || destination.name);

            if (!imageDataResult && destination.environments && destination.environments.length > 0) {
                const fallbackQuery = destination.island.toLowerCase() === "luzon"
                    ? `${destination.environments[0]} philippines`
                    : `${destination.island} ${destination.environments[0]} philippines`;
                setIsFallbackImage(true);
                imageDataResult = await fetchUnsplashImage(fallbackQuery, true);
            }

            if (isMounted) {
                if (imageDataResult) {
                    setHeroImgSrc(imageDataResult.url);
                    setImageData(imageDataResult);
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
    }, [destination, fastModeVersion]);

    useEffect(() => {
        const checkFastMode = (): boolean => {
            try {
                const saved = localStorage.getItem("fastMode");
                if (saved !== null) {
                    return saved === "true";
                }
            } catch {
                // Silently fail
            }
            return false;
        };

        const updateFastMode = () => {
            checkFastMode();
        };

        updateFastMode();

        const handleFastModeChange = () => {
            updateFastMode();
            setFastModeVersion((prev) => prev + 1);
        };

        window.addEventListener("fastModeChanged", handleFastModeChange);
        return () => {
            window.removeEventListener("fastModeChanged", handleFastModeChange);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchDescription() {
            setIsLoadingDescription(true);
            setDescription(null);

            const descriptionData = await loadDescription({
                destination,
                preferredActivity,
                activities,
                personalityId: personality?.id,
            });

            if (isMounted) {
                setDescription(descriptionData);
                setIsLoadingDescription(false);
            }
        }

        fetchDescription();

        return () => {
            isMounted = false;
        };
    }, [destination, preferredActivity, activities, fastModeVersion, personality?.id]);

    return (
        <Card className="overflow-hidden rounded-2xl shadow-sm pt-0 w-full">
            {/* Destination Image */}
            <div className="relative h-96 w-full">
                <img
                    src={heroImgSrc}
                    alt={destination.name}
                    className={`h-full w-full object-cover brightness-90 ${isLoadingImage ? "opacity-70" : ""}`}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
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

                {/* Destination Info */}
                {/* <div className="absolute bottom-1 left-4 space-y-2 text-white">
                    <h2 className="text-styled text-4xl drop-shadow-md mb-0">
                        {destination.name}
                    </h2>
                    {destination.location?.region && (
                        <p className="text-lg text-white/90 drop-shadow-md">{destination.location.region}</p>
                    )}
                </div> */}
            </div>

            <CardContent className="p-8 space-y-4">
                <div>
                    <div className="flex flex-col gap-4 mb-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-[33%]">
                            {/* {statement && (
                                <p className="text-sm font-semibold">
                                    {statement}
                                </p>
                            )} */}
                            <h2 className="text-styled text-3xl mt-2">{destination.name}</h2>
                            {destination.location?.region && (
                                <p className="text-sm font-semibold mb-2">
                                    {destination.location.region}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 max-w-[50 %] sm:justify">
                            {[...new Set(activities)].sort().map((a) => (
                                <Badge key={a} variant="outline">
                                    {pretty(a)}
                                </Badge>
                            ))}
                        </div>
                    </div>
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

                {/* Optional Environments / Seasons */}
                {/* <div className="text-xs text-slate-500 space-y-1">
                    <p>🌿 {destination.environments.join(", ")}</p>
                    <p>☀️ Best Seasons: {destination.bestSeasons.join(", ")}</p>
                </div> */}


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