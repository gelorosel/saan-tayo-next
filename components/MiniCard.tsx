"use client";

import { Card, pretty } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";

type Props = {
    destination?: Destination;
    isLoading?: boolean;
};

export default function MiniCard({ destination, isLoading = false }: Props) {
    if (isLoading || !destination) {
        return (
            <Card className="p-6 gap-2">
                <div className="h-7 w-40 bg-muted animate-pulse rounded mb-2" />
                <div className="h-5 w-28 bg-muted animate-pulse rounded mb-4" />
                <div className="flex flex-wrap gap-1">
                    {[16, 28, 16, 20, 16].map((x, i) => (
                        <div key={i} className={`h-7 w-${x} bg-muted animate-pulse rounded-full`} />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 gap-2">
            <h3 className="text-styled text-xl">{destination.name}</h3>
            {destination.location?.region && (
                <p className="text-sm font-semibold mb-2">
                    {destination.location.region}
                </p>
            )}
            <div className="flex flex-wrap gap-1">
                {[...new Set(destination.activities)].sort().map((activity) => (
                    <Badge key={activity} variant="outline">
                        {pretty(activity)}
                    </Badge>
                ))}
            </div>
        </Card>
    );
}
