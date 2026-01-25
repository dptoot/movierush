import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1a2650",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "MovieRush - Daily Movie Trivia Challenge",
  description:
    "Race against time to name movies! Daily challenges, obscure bonuses, shareable scores. Test your movie knowledge with MovieRush.",
  keywords: [
    "movie trivia",
    "daily game",
    "movie quiz",
    "film knowledge",
    "movie challenge",
    "wordle",
    "daily challenge",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "MovieRush - Daily Movie Trivia Challenge",
    description:
      "Every day, a new movie challenge. Race the clock to name as many as you can.",
    url: "https://movierush-eight.vercel.app",
    siteName: "MovieRush",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MovieRush - Daily Movie Trivia Challenge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieRush - Daily Movie Trivia Challenge",
    description:
      "Race against time to name movies! Daily challenges, obscure bonuses.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
