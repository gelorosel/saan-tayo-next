import { PersonalityProfile } from "@/src/types/personality";

export const personalities: PersonalityProfile[] = [
  {
    id: "relaxed_escapist",
    emoji: "🛌",
    name: "The Relaxed Escapist",
    category: "core",
    description:
      "You travel to slow down, not to stay busy. For you, vacations are about rest, comfort, good food, and doing less on purpose. You need space to breathe and zero guilt about taking it easy.",
    strengths: [
      "Excellent at fully unwinding and recharging",
      "Keeps trips low-stress and emotionally balanced",
      "Values comfort and sustainability over burnout",
    ],
    struggles: [
      "May miss experiences that require early starts or effort",
      "Can clash with high-energy travel companions",
      "Sometimes avoids stepping outside the comfort zone",
    ],
    compatibleWith: ["soft_life_traveler", "chill_explorer", "mood_based_traveler"],
    avoidWith: ["adventurer"],
  },
  {
    id: "adventurer",
    emoji: "🧗",
    name: "The Adventure Seeker",
    category: "core",
    description:
      "You chase movement, challenge, and stories worth telling. Travel is your excuse to reach new heights (or depths!) whether that's hiking, climbing, or diving. Rest is optional, but the outdoors is essential.",
    strengths: [
      "High energy and motivation throughout trips",
      "Creates unforgettable, story-worthy experiences",
      "Thrives in physically or mentally challenging environments",
    ],
    struggles: [
      "Can underestimate the need for rest or recovery",
      "May push others beyond their limits",
      "Finds slow-paced trips frustrating",
    ],
    compatibleWith: ["purposeful_adventurer", "free_spirited_nomad", "curious_wanderer"],
    avoidWith: ["relaxed_escapist"],
  },
  {
    id: "curious_wanderer",
    emoji: "🧭",
    name: "The Curious Wanderer",
    category: "core",
    description:
      "You're led by curiosity more than checklists. You love wandering neighborhoods, people-watching, trying local food, and following whatever catches your attention. The best moments are often unplanned and quietly memorable.",
    strengths: [
      "Naturally open to culture, people, and new perspectives",
      "Excellent at finding hidden gems",
      "Stays present and engaged in the moment",
    ],
    struggles: [
      "May lack structure or time awareness",
      "Can feel restricted by rigid schedules",
      "Sometimes struggles to prioritize must-see highlights",
    ],
    compatibleWith: ["chill_explorer", "cultural_strategist", "chaos_romantic"],
    avoidWith: ["adventurer"],
  },
  {
    id: "master_planner",
    emoji: "🗂️",
    name: "The Master Planner",
    category: "rare",
    description:
      "You plan everything because that's what makes a trip good. Schedules, bookings, and logistics give you peace of mind and freedom to actually enjoy the experience. You love knowing what's next and making every day run smoothly.",
    strengths: [
      "Minimizes stress through preparation",
      "Maximizes time and efficiency while traveling",
      "Keeps group trips organized and reliable",
    ],
    struggles: [
      "Can feel anxious when plans change unexpectedly",
      "May over-optimize at the expense of spontaneity",
      "Can clash with more flexible travelers",
    ],
    compatibleWith: ["soft_life_traveler", "cultural_strategist", "purposeful_adventurer"],
    avoidWith: ["chaos_romantic"],
  },
  {
    id: "chill_explorer",
    emoji: "🌴",
    name: "The Chill Explorer",
    category: "hybrid",
    description:
      "You like discovering new places but without the rush. You enjoy trips with exploration while keeping them flexible and low-stress. You're not afraid of some downtime as long as the day unfolds naturally.",
    strengths: [
      "Adaptable and easygoing in most situations",
      "Balances exploration with rest",
      "Great at keeping group energy calm",
    ],
    struggles: [
      "May lack urgency or direction",
      "Can be overshadowed by stronger personalities",
      "Sometimes delays decisions too long",
    ],
    compatibleWith: ["curious_wanderer", "relaxed_escapist", "mood_based_traveler"],
    avoidWith: ["master_planner"],
  },
  {
    id: "purposeful_adventurer",
    emoji: "🥾",
    name: "The Purposeful Adventurer",
    category: "hybrid",
    description:
      "You crave adventure, but with intention. You enjoy having goals, routes, and timelines even for exciting or physically demanding trips. Planning doesn't ruin the fun, it makes sure you do it correctly.",
    strengths: [
      "Combines excitement with efficiency",
      "Excellent at executing challenging plans",
      "Keeps momentum without chaos",
    ],
    struggles: [
      "May struggle with last-minute changes",
      "Can feel frustrated by indecisive companions",
      "Sometimes prioritizes goals over rest",
    ],
    compatibleWith: ["adventurer", "master_planner", "cultural_strategist"],
    avoidWith: ["chaos_romantic"],
  },
  {
    id: "free_spirited_nomad",
    emoji: "🎒",
    name: "The Free-Spirited Nomad",
    category: "rare",
    description:
      "You value freedom above all else. Fixed plans feel restrictive, and you'd rather see where the road leads than lock yourself into an itinerary. You trust that things work out, and they usually do.",
    strengths: [
      "Highly adaptable and resilient",
      "Comfortable with uncertainty and change",
      "Great at embracing unexpected opportunities",
    ],
    struggles: [
      "May resist necessary structure",
      "Can cause stress for planners",
      "Sometimes overlooks logistics or timing",
    ],
    compatibleWith: ["adventurer", "chaos_romantic", "curious_wanderer"],
    avoidWith: ["master_planner"],
  },
  {
    id: "soft_life_traveler",
    emoji: "🍷",
    name: "The Soft-Life Traveler",
    category: "hybrid",
    description:
      "You believe travel should feel good. Comfort, ease, and a pleasant pace matter more than doing everything. Whether it's a nice hotel, great meals, or relaxed days, you prioritize enjoyment over endurance.",
    strengths: [
      "Excellent at creating enjoyable, comfortable trips",
      "Knows how to savor experiences",
      "Protects personal energy and well-being",
    ],
    struggles: [
      "May avoid physically demanding activities",
      "Can feel out of sync with fast-moving companions",
      "Sometimes prioritizes comfort over exploration",
    ],
    compatibleWith: ["master_planner", "relaxed_escapist", "mood_based_traveler"],
    avoidWith: ["adventurer"],
  },
  {
    id: "cultural_strategist",
    emoji: "🧠",
    name: "The Cultural Strategist",
    category: "hybrid",
    description:
      "You travel to understand places deeply. History, heritage, and local cuisine matter to you, and you enjoy learning as you go. You like a thoughtful balance of structure and exploration to make travel meaningful.",
    strengths: [
      "Engages deeply with culture and history",
      "Adds meaning and context to trips",
      "Balances learning with exploration",
    ],
    struggles: [
      "May over-schedule educational activities",
      "Can feel frustrated by surface-level travel",
      "Sometimes undervalues rest or spontaneity",
    ],
    compatibleWith: ["curious_wanderer", "master_planner", "purposeful_adventurer"],
    avoidWith: ["chaos_romantic"],
  },
  {
    id: "chaos_romantic",
    emoji: "🎭",
    name: "The Chaos Romantic",
    category: "hybrid",
    description:
      "You thrive in spontaneity and surprise. Plans are loose suggestions at best, and you love the energy of not knowing what's next. Your trips are unpredictable, story-filled, and never boring.",
    strengths: [
      "Highly creative and adaptable",
      "Turns accidents into memorable moments",
      "Keeps trips exciting and dynamic",
    ],
    struggles: [
      "Can create stress for structured travelers",
      "May overlook important logistics",
      "Sometimes sacrifices stability for novelty",
    ],
    compatibleWith: ["free_spirited_nomad", "chill_explorer", "curious_wanderer"],
    avoidWith: ["master_planner"],
  },
  {
    id: "mood_based_traveler",
    emoji: "🧳",
    name: "The Mood-Based Traveler",
    category: "core",
    description:
      "Your travel style changes with how you feel. Some days you're out exploring, other days you're resting. You value flexibility and do whatever feels right for the day.",
    strengths: [
      "Emotionally attuned and self-aware",
      "Flexible and non-judgmental about pacing",
      "Adapts well to changing energy levels",
    ],
    struggles: [
      "Can be hard for others to predict",
      "May struggle with firm commitments",
      "Sometimes delays decisions until the last minute",
    ],
    compatibleWith: ["chill_explorer", "soft_life_traveler", "relaxed_escapist"],
    avoidWith: ["purposeful_adventurer"],
  },
];


export const personalityById = new Map(
  personalities.map((personality) => [personality.id, personality])
);
