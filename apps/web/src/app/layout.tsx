import type { Metadata } from 'next';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Nav from '@/components/nav';
import './globals.css';
import './shell.css';

export const metadata: Metadata = {
  title: 'Amber — Your Health Network',
  description: 'The connective layer between your health, your people, and your self-awareness.',
  openGraph: {
    title: 'Amber — Your Health Network',
    description: 'Track six dimensions of health and see how your relationships shape your wellbeing.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <div className="appShell">
            <Nav />
            <div className="appContent">
              {children}
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
