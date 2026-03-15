import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellbeing — Brain Health by Amber",
  description:
    "A brain health platform built on Amber's graph. Tracks your mental health and catches early signs of cognitive decline — decades before diagnosis.",
  keywords: ["mental health", "cognitive decline", "Alzheimer's", "brain health", "Amber", "wellbeing"],
  openGraph: {
    title: "Wellbeing — Brain Health by Amber",
    description:
      "A brain health platform built on Amber's graph. Tracks your mental health and catches early signs of cognitive decline — decades before diagnosis.",
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
