import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Archive — Permanent Preservation",
  description:
    "Permanent preservation infrastructure for human knowledge, art, and culture. Triple-redundant, cryptographically verified, built to outlast the internet.",
  keywords: ["preservation", "archive", "digital preservation", "library", "cultural heritage", "Amber"],
  openGraph: {
    title: "The Archive — Permanent Preservation",
    description:
      "Permanent preservation infrastructure for human knowledge, art, and culture. Triple-redundant, cryptographically verified, built to outlast the internet.",
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
