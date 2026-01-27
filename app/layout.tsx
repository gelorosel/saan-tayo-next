import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import "./custom.css";
import Footer from "@/components/Footer";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saan Tayo Next?",
  description: "This is where you belong right now.",
  openGraph: {
    title: "Saan Tayo Next?",
    description:
      "This is where you belong right now. A gentle travel mirror for the Philippines.",
    type: "website",
    locale: "en_US",
    siteName: "Saan Tayo Next?",
    images: [
      {
        url: "/images/default-img.jpeg",
        width: 1200,
        height: 630,
        alt: "This is where you belong right now.",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={comfortaa.variable}>
      <body
        className="antialiased flex flex-col min-h-screen"
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
