import { Question } from "@/src/types/question";

export const questions: Question[] = [
  {
    id: "season",
    question: "When are you traveling?",
    options: [
      { label: "Cool dry season (Dec - Feb)", value: "cool_dry" },
      { label: "Hot dry season (March - May)", value: "hot_dry" },
      { label: "Wet season (June - Nov)", value: "wet" },
      { label: "Any time!", value: "any" },
    ],
  },
  {
    id: "environment",
    question: "Beach, mountains, or city?",
    options: [
      { label: "Beach", value: "beach" },
      { label: "Mountains", value: "mountains" },
      { label: "City", value: "city" },
      { label: "Anywhere!", value: "any" },
    ],
  },
  {
    id: "vibe",
    question: "What kind of day do you want?",
    options: [
      { label: "A slow and easy day for resting", value: "rest" },
      { label: "An exciting day for an outdoor activities", value: "activities" },
      { label: "A day fully booked with sights and scenes", value: "sights" },
      { label: "An inspiring day for learning and culture", value: "learn" },
    ],
  },
  {
    id: "activity",
    question: "What do you want to do?",
    // options are calculated based on the environment and vibe
  },
  {
    id: "traveler_morning",
    question: "Your ideal morning on a trip starts with...",
    shuffle: true,
    options: [
      { label: "Sleeping in, no alarms", value: "a" },
      { label: "Catching the sunrise for a head start", value: "b" },
      { label: "Coffee + wandering with no plan", value: "c" },
      { label: "A packed itinerary and tickets booked", value: "d" },
    ],
  },
  {
    id: "traveler_afternoon",
    question: "After breakfast, It's time to...",
    shuffle: true,
    options: [
      { label: "Beach, pool, or nap - vibes only", value: "a" },
      { label: "Explore nature or do something active", value: "b" },
      { label: "Get lost in local streets, markets, or cafes", value: "c" },
      { label: "Visit top landmarks or museums", value: "d" },
    ],
  },
  {
    id: "traveler_spend",
    question: "Your travel budget is mostly spent on...",
    shuffle: true,
    options: [
      { label: "Comfort (hotels, food, upgrades)", value: "a" },
      { label: "Transportation (fuel, boat rides, rented vehicles)", value: "b" },
      { label: "Local food, small bites, and unique finds", value: "c" },
      { label: "Experiences (attractions, tours, activities)", value: "d" },
    ],
  },
  {
    id: "traveler_suitcase",
    question: "Your suitcase is usually...",
    shuffle: true,
    options: [
      { label: "Light, comfy clothes only", value: "a" },
      { label: "Practical gear and sneakers", value: "b" },
      { label: "A mix of styles just in case", value: "c" },
      { label: "Carefully planned outfits for each day", value: "d" },
    ],
  },
  {
    id: "traveler_plans",
    question: "Your trip is about to start! You can't wait to...",
    shuffle: true,
    options: [
      { label: "Escape the routine and wind down", value: "a" },
      { label: "Experience something new", value: "b" },
      { label: "Absorb the local culture", value: "c" },
      { label: "Get the most out of your time and budget", value: "d" },
    ],
  },
  {
    id: "island",
    question: "Where do you want to go?",
    options: [
      { label: "Luzon", value: "luzon" },
      { label: "Visayas", value: "visayas" },
      { label: "Mindanao", value: "mindanao" },
    ],
  },
];
