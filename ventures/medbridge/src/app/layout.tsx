import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedBridge — Your health records, unified',
  description:
    'MedBridge ingests records from every portal, PDF, and FHIR endpoint you have and normalizes them into one patient-controlled health timeline.',
  openGraph: {
    title: 'MedBridge — Your health records, unified',
    description: 'Ingest anything. Normalize everything. Share cleanly.',
    siteName: 'MedBridge',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
