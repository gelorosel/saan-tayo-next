"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Destination } from "@/src/types/destination";
import { Badge } from "lucide-react";

type Props = {
    destination: Destination;
    /** Optional: show only relevant activities */
    activitiesOverride?: Destination["activities"];
};

const pretty = (v: string) =>
    v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DestinationResultCard({
    destination,
    activitiesOverride,
}: Props) {
    const hero = "https://images.unsplash.com/photo-1519046904884-53103b34b206";
    const activities = activitiesOverride ?? destination.activities;

    const handleGoogleSearch = () => {
        const searchQuery = encodeURIComponent(`${destination.name} ${destination.island} Philippines`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card className="overflow-hidden rounded-2xl shadow-sm">
            {/* Hero image */}
            <div className="relative h-72 w-full">
                <img
                    src={hero}
                    alt={`${destination.name} hero`}
                    className="h-full w-full object-cover"
                />
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
