# Saan Tayo Next?

Find your next Philippine destination! A travel recommendation app that helps you discover the perfect destination in the Philippines based on your preferences.

This project was inspired by [bchiang7/time-to-have-more-fun](https://github.com/bchiang7/time-to-have-more-fun/tree/main).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Key Features Explained

### Scoring Algorithm

Destinations are scored based on multiple factors:
- **Filters**: by Island group (Luzon, Visayas, Mindanao) and environment (beach, mountains, city)
- **Base score**: Starts at 0
- **Activity match**: +5 points if destination matches preferred activity
- **Season match**: +2 points if season matches, +1 otherwise
- **Special bias**: +5 points for reef destinations when activity is diving

### Image Fetching

Images are dynamically fetched from Unsplash using a multi-tier fallback strategy:

1. **Primary Query**: First attempts to fetch an image using the destination name (or `overrideUnsplashName` if specified)
2. **Fallback Query**: If no image is found, queries using `{island} {environment} philippines` (e.g., "Luzon beach philippines")
3. **Random Selection**: For fallback queries, randomly selects one image from the top 10 results to provide variety
4. **Final Fallback**: If both queries fail, uses a default fallback image


**Fast Mode**: When enabled, skips all image fetching and removes image element.

### Description Priority

By default, descriptions are fetched from Wikipedia first, with Gemini AI as fallback. You can reverse this priority by setting `PRIORITIZE_GEMINI_DESCRIPTION=true`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

Create a `.env.local` file with the following variables:

- `UNSPLASH_ACCESS_KEY` - Your Unsplash API access key
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PRIORITIZE_GEMINI_DESCRIPTION` (optional) - Set to `true` to prioritize Gemini descriptions over Wikipedia

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

See [LICENSE](LICENSE) file for details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Google Gemini API](https://ai.google.dev)
- [Unsplash API](https://unsplash.com/developers)

