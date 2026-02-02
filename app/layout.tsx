import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./custom.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const barabara = localFont({
  src: "../public/fonts/BARABARA-final.otf",
  variable: "--font-barabara",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saan-tayo-next.gelorosel.com/"),
  title: {
    default: "Saan Tayo Next? - Find Your Perfect Philippine Destination",
    template: "%s | Saan Tayo Next?",
  },
  description: "Discover your ideal Philippine travel destination with our personalized quiz. Find beaches, mountains, cultural sites, and hidden gems tailored to your travel style. Plan your next Philippine adventure today!",
  keywords: [
    "Philippines travel",
    "Philippine destinations",
    "travel quiz",
    "beach destinations Philippines",
    "mountain destinations Philippines",
    "Philippine tourism",
    "travel planner",
    "vacation Philippines",
    "Philippine islands",
    "travel recommendations",
    "Saan Tayo Next",
    "Philippine adventure",
    "travel guide Philippines",
  ],
  authors: [{ name: "Saan Tayo Next" }],
  creator: "Gelo Rosel",
  publisher: "Gelo Rosel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Saan Tayo Next? - Find Your Perfect Philippine Destination",
    description:
      "Discover your ideal Philippine travel destination with our personalized quiz. Find beaches, mountains, cultural sites, and hidden gems tailored to your travel style.",
    type: "website",
    locale: "en_US",
    siteName: "Saan Tayo Next?",
    images: [
      {
        url: "/images/default-img.jpeg",
        width: 1200,
        height: 630,
        alt: "Saan Tayo Next? - Philippine Travel Destination Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saan Tayo Next? - Find Your Perfect Philippine Destination",
    description: "Discover your ideal Philippine travel destination with our personalized quiz. Beaches, mountains, culture & more!",
    images: ["/images/default-img.jpeg"],
    creator: "@saantayonext",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = "https://saan-tayo-next.gelorosel.com/";
  const baseName = "Saan Tayo Next?";
  const descriptionText = "Discover your ideal Philippine travel destination with our personalized quiz. Find beaches, mountains, cultural sites, and hidden gems tailored to your travel style.";

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": baseName,
    "description": descriptionText,
    "url": baseUrl,
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": baseName,
      "url": baseUrl
    },
    "inLanguage": "en-US",
    "about": {
      "@type": "Place",
      "name": "Philippines",
      "description": "Travel destinations across the Philippines"
    }
  };

  return (
    <html lang="en" className={`${comfortaa.variable} ${barabara.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`antialiased flex flex-col min-h-screen ${comfortaa.variable} ${barabara.variable}`}
      >
        <h1 className="sr-only">{baseName}</h1>
        <p className="sr-only">{descriptionText}</p>
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
