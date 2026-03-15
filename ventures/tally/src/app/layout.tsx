import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tally — Get paid for the things you actually recommend",
  description:
    "Tally turns your social circle into a high-trust referral network. Rewards for recommendations that are real, not sponsored posts. Word-of-mouth drives 13% of all consumer purchases — now you get a cut.",
  keywords: ["referral", "word-of-mouth", "social commerce", "recommendations", "earn money", "tally"],
  openGraph: {
    title: "Tally — Get paid for the things you actually recommend",
    description:
      "Monetize your friends, ethically. Built with Cayden Ginting. If you genuinely loved something and your friend buys it, you both win.",
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
