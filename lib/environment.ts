
export const prettyEnvironment = (value?: string) => {
    if (!value) return "somewhere that fits";
    if (value === "beach") return "the beach";
    if (value === "mountains") return "the mountains";
    if (value === "city") return "the city";
    if (value === "any") return "anywhere";
    return "somewhere that fits";
};

export const seasonLabels: Record<string, string> = {
    cool_dry: "cool dry season",
    hot_dry: "hot dry season",
    wet: "wet season",
};