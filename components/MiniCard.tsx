"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Destination } from "@/src/types/destination";

type Props = {
    destination: Destination;
};

const pretty = (v: string) =>
    v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function MiniCard({ destination }: Props) {
    return (
        <Card className="p-6 gap-2">
            <h4 className="text-styled">{destination.name}</h4>
            <div className="flex flex-wrap gap-1">
                {[...new Set(destination.activities)].sort().map((activity) => (
                    <Badge key={activity} variant="outline" className="text-xs px-1.5 py-0.5">
                        {pretty(activity)}
                    </Badge>
                ))}
            </div>
        </Card>
    );
}
