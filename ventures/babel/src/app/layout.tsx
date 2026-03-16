import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Babel — Speak your language. Be understood in theirs.",
  description:
    "Real-time universal translation so any two human beings can speak to each other in their own language, instantly and for free. Powered by Amber's relationship graph.",
  keywords: ["translation", "universal translator", "language", "real-time", "amber", "babel"],
  openGraph: {
    title: "Babel — Speak your language. Be understood in theirs.",
    description:
      "Real-time universal translation powered by Amber's relationship graph. 7,000 languages. 1.5 billion second-language speakers. The conversation is all that matters.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
