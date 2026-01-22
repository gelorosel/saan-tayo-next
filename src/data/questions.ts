// src/data/questions.ts
export const questions = [
    {
      id: "island",
      question: "Which island group?",
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
        { label: "Cool dry season", value: "cool_dry" },
        { label: "Hot dry season", value: "hot_dry" },
        { label: "Wet season", value: "wet" },
        { label: "Surprise me", value: "surprise" },
      ],
    },
  ];
  