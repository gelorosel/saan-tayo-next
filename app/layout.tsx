import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import "./custom.css";
import Footer from "@/components/Footer";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saan Tayo Next?",
  description: "Find your next Philippine destination!",
  openGraph: {
    title: "Saan Tayo Next?",
    description: "Find your next Philippine destination! A travel recommendation app that helps you discover the perfect destination in the Philippines based on your preferences.",
    type: "website",
    locale: "en_US",
    siteName: "Saan Tayo Next?",
    images: [
      {
        url: "/images/default-img.jpeg",
        width: 1200,
        height: 630,
        alt: "Find your next Philippine destination!",
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
    <html lang="en">
      <body
        className={`${comfortaa.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
