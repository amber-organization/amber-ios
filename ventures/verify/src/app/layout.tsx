import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verify — Healthy Tech Index + Sentinel",
  description:
    "Two products: the Healthy Tech Index rates every app by what it does to real people, and Sentinel provides independent AI safety auditing for enterprises.",
  keywords: ["healthy tech", "AI safety", "tech ratings", "digital wellness", "AI audit", "Amber", "Verify"],
  openGraph: {
    title: "Verify — Healthy Tech Index + Sentinel",
    description:
      "Two products: the Healthy Tech Index rates every app by what it does to real people, and Sentinel provides independent AI safety auditing for enterprises.",
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
