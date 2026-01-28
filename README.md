# Saan Tayo Next? 🇵🇭

Find your next Philippine destination! A personalized travel recommendation app that matches you with the perfect destinations in the Philippines based on your travel personality, preferences, and style.

This project was inspired by [bchiang7/time-to-have-more-fun](https://github.com/bchiang7/time-to-have-more-fun/tree/main).

## Features

### Personality-Based Recommendations
- **8 Unique Travel Personalities**: Discover your travel archetype through a quiz (The Master Planner, The Soft-Life Traveler, The Cultural Strategist, The Chaos Romantic, The Adrenaline Chaser, The Nature Romantic, The Beach Minimalist, The Everywhere Explorer)
- **Personality Matching**: Each personality has preferred activities and travel companions that influence destination scoring
- **"Something New" Mode**: Choose to explore destinations outside your usual travel style for fresh experiences

### Smart Destination Matching
- **Multi-Criteria Filtering**: Filter by island group (Luzon, Visayas, Mindanao), environment (beach, mountains, city, any), and season
- **Activity-Based Scoring**: Select activities to find destinations that match your interests
- **Vibe-Based Activities**: Choose your travel mood (rest, activities, sights, learn) to get relevant activity suggestions
- **Dynamic Reasons**: See personalized explanations for why each destination fits your preferences

### Scoring Algorithm

Destinations are scored using an optimized multi-factor algorithm:
- **Environment Match**: Filters destinations by your preferred environment
- **Island Group Filter**: Narrows results to your chosen region
- **Primary Activity**: +5 points for matching your top activity choice
- **Additional Activities**: +2 points per additional matching activity (when selecting multiple)
- **Personality Match**: +2 points per activity that aligns with your travel personality (when enabled)
- **Season Compatibility**: +2 points for optimal season, +1 for acceptable season
- **Special Bonuses**: +5 points for reef diving destinations when diving is selected
- **"Something New" Detection**: Highlights destinations with activities outside your personality profile

### Image Handling

Images are dynamically fetched from Unsplash with a sophisticated fallback strategy:

1. **Primary Query**: Uses destination name (or `overrideUnsplashName` if specified)
2. **Fallback Query**: Falls back to `{island} {environment} philippines` (e.g., "Luzon beach philippines")
3. **Random Selection**: Randomly selects from top 10 results for variety

**Fast Mode**: Skips all image fetching for faster results.

### Share Results

- **Image Generation**: Creates shareable PNG images using `html-to-image`
- **Download & Share**: Download your results or share directly to social media
- **Personalized Cards**: Includes your name, personality type, destination details, and reasons

### Description Priority

By default, descriptions are fetched from Wikipedia first, with Gemini AI as fallback. You can reverse this priority by setting `PRIORITIZE_GEMINI_DESCRIPTION=true`.

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

The app will auto-reload as you edit files.

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
GEMINI_API_KEY=your_google_gemini_api_key

# Optional
PRIORITIZE_GEMINI_DESCRIPTION=true  # Default: false (uses Wikipedia first)
```

**Getting API Keys:**
- **Unsplash**: Sign up at [Unsplash Developers](https://unsplash.com/developers)
- **Google Gemini**: Get your key at [Google AI Studio](https://ai.google.dev)

## 📁 Project Structure

```
saan-tayo-next/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main quiz interface
│   ├── layout.tsx                # Root layout with fonts
│   └── api/                      # API routes
│       └── unsplash/image/       # Image proxy endpoint
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
│   └── utils.ts                  # Helper utilities
└── public/                       # Static assets
```

## Tech Stack

- **Framework**: [Next.js 16.1.4](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Image Processing**: [html-to-image](https://github.com/bubkoo/html-to-image)
- **Icons**: [Lucide React](https://lucide.dev)
- **APIs**: Unsplash, Google Gemini, Wikipedia

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 Adding New Destinations

Edit `src/data/destinations.ts`:

```typescript
{
  name: "Your Destination",
  province: "Province Name",
  island: "luzon", // or "visayas" | "mindanao"
  environments: ["beach", "mountains"], // Array of Environment types
  activities: ["swim", "hike", "explore"], // Array of Activity types
  bestSeasons: ["hot_dry"], // Array of Season types
  overrideUnsplashName: "Custom Search Term", // Optional
}
```

## 🧪 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [time-to-have-more-fun](https://github.com/bchiang7/time-to-have-more-fun)
- Destination data compiled from various Philippine tourism sources
- Images provided by [Unsplash](https://unsplash.com)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Google Gemini API](https://ai.google.dev)
- [Unsplash API](https://unsplash.com/developers)
