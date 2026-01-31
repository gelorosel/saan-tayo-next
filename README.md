# Saan Tayo Next? 🇵🇭

Find your next Philippine destination! A personalized travel recommendation app that matches you with the perfect destinations in the Philippines based on your travel personality, preferences, and style.

This project was inspired by [bchiang7/time-to-have-more-fun](https://github.com/bchiang7/time-to-have-more-fun/tree/main).

## Features

### Personality-Based Recommendations
- 8 unique travel personalities: The Master Planner, The Soft-Life Traveler, The Cultural Strategist, The Chaos Romantic, The Adrenaline Chaser, The Nature Romantic, The Beach Minimalist, The Everywhere Explorer
- Personality matching influences destination scoring
- "Something New" selection explores destinations outside your usual style

### Smart Destination Matching
- Multi-criteria filtering: island group, environment, season
- Activity-based scoring
- Vibe-based activity suggestions (rest, activities, sights, learn)
- Personalized explanations for each recommendation

### Scoring Algorithm

Implemented in `lib/score.ts`:

**Filtering Phase:**
- Island group match (Luzon/Visayas/Mindanao)
- Environment match (beach, mountains, city, or "any")
- Non-negotiable activities: single activity selections for dive, surf, trek, camp, waterfalls, history, museums, relax, swim require destinations to include that activity

**Scoring Phase:**
- Primary activity match: +5 points
- Additional activities: +2 points each
- Personality match: +2 points per matched activity (unless "Something New" mode)
- Season compatibility: +2 points (optimal) or +1 point (acceptable)
- Reef diving bonus: +5 points

**Final Ranking:**
- Destinations randomized before scoring
- Sorted by total score (highest first)
- Personalized reasons generated for each match

### Unsplash API Integration

Implemented in `lib/unsplash.ts` and `app/api/unsplash/route.ts`:

**Image Selection:**
1. Some destinations deserve their own non-automated tribute photos, they are stored locally in `public/images/` and override the unsplash process completely
2. Primary query: destination name or `overrideUnsplashName`
3. Fallback query: intelligent fallback based on environment (e.g., "beach philippines")
4. Smart random selection from top 20 results
5. Filters out blocked images and last 3 used fallback images

**Caching:**
- API response cache: prevents duplicate API calls
- Image binary cache: stores proxied image data
- Fallback image cache (localStorage): tracks last 3 used images to prevent repeats

**Image Proxy:**
- All images proxied through `/api/unsplash/image` for iOS compatibility
- CORS headers and download tracking

**Fast Mode:** Skips image fetching, uses local fallback.

**Rate Limiting:**
- Client-side rate limiting prevents excessive API usage
- Default: 50 description requests per session (24-hour timeout)
- Cached descriptions don't count toward the limit
- Elegant modal notification when limit is reached
- Counter shows remaining requests
- Easy to configure via `RATE_LIMIT_TIMEOUT_HOURS` in `lib/rateLimit.ts`

### Generated Descriptions
Fetch destination information from either Wikipedia API or Google Gemini.
Wikipedia first, Gemini as fallback. Reverse with `PRIORITIZE_GEMINI_DESCRIPTION=true`.

### Share Results

- Generate shareable PNG images using `html-to-image`
- Download or share directly to social media
- Includes personality type, destination details, and match reasons

### Google Gemini API Integration

Implemented in `lib/gemini.ts` using Gemini 2.5 Flash Lite model:

**Generated Content:**
- 2-3 sentence destination description
- Best months to visit
- Activity-specific details (trail difficulty, marine life, wave conditions, etc.)
- Personality-tailored recommendations

**Caching & Performance:**
- In-memory cache (500 entries with LRU eviction)
- Cache key: `destinationName|activity|personalityId`
- Retry logic with exponential backoff (up to 2 retries)
- Reduces API calls by ~80-90%

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/saan-tayo-next.git
cd saan-tayo-next
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file (see Environment Variables below)

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
GEMINI_API_KEY=your_google_gemini_api_key

# Optional
PRIORITIZE_GEMINI_DESCRIPTION=true  # Default: false (uses Wikipedia first)
```

**API Keys:**
- Unsplash: [Unsplash Developers](https://unsplash.com/developers)
- Google Gemini: [Google AI Studio](https://ai.google.dev)

## Project Structure

```
saan-tayo-next/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main quiz interface
│   ├── layout.tsx                # Root layout with fonts
│   └── api/                      # API routes
│       └── unsplash/             # Unsplash API endpoints
│           ├── route.ts          # Image search endpoint
│           ├── image/route.ts    # Image proxy endpoint
│           └── download/route.ts # Download tracking endpoint
├── components/                   # React components
│   ├── QuestionCard.tsx          # Quiz question UI
│   ├── PersonalityResultCard.tsx # Result display
│   ├── ShareResultModal.tsx      # Share functionality
│   └── ui/                       # Reusable UI components
├── src/
│   ├── data/                     # Data definitions
│   │   ├── activities.ts         # Activity types and vibe mapping
│   │   ├── destinations.ts       # 100+ Philippine destinations
│   │   ├── personalities.ts      # 8 personality profiles
│   │   └── questions.ts          # Quiz questions
│   └── types/                    # TypeScript type definitions
├── lib/                          # Utility functions
│   ├── score.ts                  # Destination scoring algorithm
│   ├── personalityScore.ts       # Personality calculation
│   ├── preference.ts             # Preference parsing
│   ├── gemini.ts                 # Gemini AI integration with caching
│   ├── unsplash.ts               # Unsplash API integration with fallback logic
│   ├── description.ts            # Description fetching (Wikipedia + Gemini)
│   └── utils.ts                  # Helper utilities
└── public/                       # Static assets
```

## Tech Stack

- Framework: [Next.js 16.1.4](https://nextjs.org) (App Router)
- Language: TypeScript
- Styling: [Tailwind CSS 4](https://tailwindcss.com)
- UI Components: [Radix UI](https://www.radix-ui.com)
- Animations: [Framer Motion](https://www.framer.com/motion/)
- Image Processing: [html-to-image](https://github.com/bubkoo/html-to-image)
- QR Codes: [qrcode.react](https://github.com/zpao/qrcode.react)
- Icons: [Lucide React](https://lucide.dev)
- AI: [Google Generative AI SDK](https://www.npmjs.com/package/@google/genai)
- APIs: Unsplash, Google Gemini, Wikipedia

## Deployment

### Vercel

1. Push code to GitHub
2. Import repository to [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

### Other Platforms

Compatible with Netlify, AWS Amplify, Railway, Render, or any platform supporting Next.js.

## API Usage & Rate Limits

**Unsplash API:**
- Free tier: 50 requests/hour
- In-memory caching reduces duplicate requests
- Local fallback when quota exceeded

**Google Gemini API:**
- Model: Gemini 2.5 Flash Lite
- Pricing: Pay-as-you-go ([pricing info](https://ai.google.dev/pricing))
- Caching reduces costs by ~80-90%
- Generous free tier available

**Wikipedia API:**
- Free, no API key required
- Default description source

## Adding New Destinations

Edit `src/data/destinations.ts`:

```typescript
{
  name: "Your Destination",
  province: "Province Name",
  island: "luzon", // or "visayas" | "mindanao"
  environments: ["beach", "mountains"], // Array of Environment types
  activities: ["swim", "hike", "explore"], // Array of Activity types
  bestSeasons: ["hot_dry"], // Array of Season types
  overrideUnsplashName: "Custom Search Term", // Optional: for better image results
  overrideGoogleSearchName: "Custom Search", // Optional: for better Google results
  location: { 
    region: "Region Name" // Optional: for grouping related destinations
  }
}
```

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

See [LICENSE](LICENSE) file.

## Acknowledgments

- Inspired by [time-to-have-more-fun](https://github.com/bchiang7/time-to-have-more-fun)
- Images from [Unsplash](https://unsplash.com)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Google Gemini API](https://ai.google.dev)
- [Unsplash API](https://unsplash.com/developers)
