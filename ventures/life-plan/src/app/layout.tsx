import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Plan Assistant",
  description: "Your personality, values, and goals mapped into a real plan. Powered by Amber.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
