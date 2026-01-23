// src/data/questions.ts
export const questions = [
  {
    id: "island",
    question: "Pick an island group!",
    options: [
      { label: "Luzon", value: "luzon" },
      { label: "Visayas", value: "visayas" },
      { label: "Mindanao", value: "mindanao" },
      { label: "Surprise me", value: "surprise" },
    ],
  },
  {
    id: "environment",
    question: "Beach, mountains, or city?",
    options: [
      { label: "Beach", value: "beach" },
      { label: "Mountains", value: "mountains" },
      { label: "City", value: "city" },
      { label: "Surprise me", value: "surprise" },
    ],
  },
  {
    id: "activity",
    question: "What do you want to do?",
    options: [], // dynamic
  },
  {
    id: "season",
    question: "When are you traveling?",
    options: [
      { label: "Cool dry season (Dec - Feb)", value: "cool_dry" },
      { label: "Hot dry season (March - May)", value: "hot_dry" },
      { label: "Wet season (June - Nov)", value: "wet" },
      { label: "Surprise me", value: "surprise" },
    ],
  },
];
