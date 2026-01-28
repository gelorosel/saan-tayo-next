"use client";

import { Card, pretty } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";

type Props = {
    destination: Destination;
};

export default function MiniCard({ destination }: Props) {
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
