// src/data/questions.ts
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
      { label: "Slow and easy", value: "slow" },
      { label: "Move and challenge", value: "move" },
      { label: "Wander and taste", value: "wander" },
      { label: "See and learn", value: "learn" },
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
    options: [
      { label: "Sleeping in, no alarms", value: "a" },
      { label: "A sunrise hike or workout", value: "b" },
      { label: "Coffee + wandering with no plan", value: "c" },
      { label: "A packed itinerary and tickets booked", value: "d" },
    ],
  },
  {
    id: "traveler_afternoon",
    question: "You have a free afternoon. What do you do?",
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
    options: [
      { label: "Comfort (hotels, food, upgrades)", value: "a" },
      { label: "Experiences (adventures, tours, activities)", value: "b" },
      { label: "Local food, coffee, and small finds", value: "c" },
      { label: "Must-see attractions and guided trips", value: "d" },
    ],
  },
  {
    id: "traveler_suitcase",
    question: "Your suitcase is usually...",
    options: [
      { label: "Light, comfy clothes only", value: "a" },
      { label: "Practical gear and sneakers", value: "b" },
      { label: "A mix of styles just in case", value: "c" },
      { label: "Carefully planned outfits for each day", value: "d" },
    ],
  },
  {
    id: "traveler_plans",
    question: "Travel plans make you feel...",
    options: [
      { label: "Best when flexible and spontaneous", value: "a" },
      { label: "Excited if there's something challenging", value: "b" },
      { label: "Curious - anything new is fun", value: "c" },
      { label: "Calm when everything is organized", value: "d" },
    ],
  },
  {
    id: "island",
    question: "Pick an island group!",
    options: [
      { label: "Luzon", value: "luzon" },
      { label: "Visayas", value: "visayas" },
      { label: "Mindanao", value: "mindanao" },
    ],
  },
];
