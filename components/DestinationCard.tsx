"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Destination } from "@/src/types/destination";
import { Badge } from "lucide-react";
import { openGoogleSearch } from "@/lib/destination";

type Props = {
    destination: Destination;
    /** Optional: show only relevant activities */
    activitiesOverride?: Destination["activities"];
};

const pretty = (v: string) =>
    v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519046904884-53103b34b206";

async function fetchUnsplashImage(query: string, randomFromTop10: boolean = false): Promise<string | null> {
    console.log(`${query} fetching Unsplash image`);
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
            return data.results[randomIndex].url || null;
        }

        return data.url || null;
    } catch (error) {
        console.error("Error fetching Unsplash image:", error);
        return null;
    }
}

export default function DestinationResultCard({
    destination,
    activitiesOverride,
}: Props) {
    const [heroImgSrc, setHeroImgSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoading, setIsLoading] = useState(true);
    const activities = activitiesOverride ?? destination.activities;

    useEffect(() => {
        let isMounted = true;

        async function loadImage() {
            setIsLoading(true);

            // First try: query by destination name
            let imageUrl = await fetchUnsplashImage(destination.name);

            // Fallback: query by environment + philippines (random from top 10)
            if (!imageUrl && destination.environments && destination.environments.length > 0) {
                const fallbackQuery = `${destination.environments[0]} philippines`;
                imageUrl = await fetchUnsplashImage(fallbackQuery, true);
            }

            if (isMounted) {
                setHeroImgSrc(imageUrl || FALLBACK_IMAGE);
                setIsLoading(false);
            }
        }

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [destination]);

    const handleGoogleSearch = () => {
        openGoogleSearch(destination);
    };

    return (
        <Card className="overflow-hidden rounded-2xl shadow-sm pt-0">
            {/* hero image */}
            <div className="relative h-72 w-full">
                {isLoading ? (
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
            </div>

            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-semibold">{destination.name}</h2>
                    <p className="text-muted-foreground">
                        {destination.island.toUpperCase()}
                        {destination.location?.region
                            ? ` · ${destination.location.region}`
                            : ""}
                    </p>
                </div>

                {/* Activities */}
                <div className="flex flex-wrap gap-2">
                    {activities.map((a) => (
                        <Badge key={a} className="px-3 py-1">
                            {pretty(a)}
                        </Badge>
                    ))}
                </div>

                {/* Description */}
                {destination.description && (
                    <p className="text-sm text-muted-foreground">
                        {destination.description}
                    </p>
                )}

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
