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
  description: "Race against time to name movies! Daily challenges, obscure bonuses, shareable scores.",
  icons: {
    icon: "/movie-rush.png",
    apple: "/movie-rush.png",
  },
  openGraph: {
    title: "MovieRush - Daily Movie Trivia Challenge",
    description: "Race against time to name movies! Daily challenges, obscure bonuses, shareable scores.",
    images: ["/movie-rush.png"],
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
