import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css";
import AOSInit from "@/components/AOSInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "D-NOB: Dedicated Network of Belonging",
  description: "A protected community platform connecting pediatric patients with peers during treatment, turning hospital isolation into real friendship.",
  keywords: ["pediatric", "hospital", "community", "children", "friendship", "D-NOB"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "D-NOB: Dedicated Network of Belonging",
    description: "A protected community platform connecting pediatric patients with peers during treatment, turning hospital isolation into real friendship.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} antialiased`}>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
