import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthy Tech Index",
  description: "Every app and device rated by what it actually does to the people who use it.",
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
