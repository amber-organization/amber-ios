'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';

const AUTH_PROVIDERS = [
  {
    key: 'google',
    label: 'Continue with Google',
    connection: 'google-oauth2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    style: 'glass',
  },
  {
    key: 'apple',
    label: 'Continue with Apple',
    connection: 'apple',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    style: 'dark',
  },
  {
    key: 'github',
    label: 'Continue with GitHub',
    connection: 'github',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    style: 'glass',
  },
  {
    key: 'linkedin',
    label: 'Continue with LinkedIn',
    connection: 'linkedin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    style: 'glass',
  },
  {
    key: 'microsoft',
    label: 'Continue with Microsoft',
    connection: 'windowslive',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
        <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
        <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
        <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
      </svg>
    ),
    style: 'glass',
  },
  {
    key: 'email',
    label: 'Continue with Email',
    connection: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    style: 'blue',
  },
] as const;

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/onboarding');
  }, [user, router]);

  const handleSignIn = (connection: string | null) => {
    const params = connection
      ? `/api/auth/login?connection=${connection}&returnTo=/onboarding`
      : `/api/auth/login?returnTo=/onboarding`;
    window.location.href = params;
  };

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>Health Network</div>
        <h1 className={styles.title}>
          Your health is shaped<br />
          by the people around you.
        </h1>
        <p className={styles.subtitle}>
          Amber makes that visible. Six dimensions of health. One unified view of your wellbeing, your relationships, and your life.
        </p>
      </section>

      {/* Dimensions */}
      <section className={styles.dimensions}>
        {[
          { icon: '◉', label: 'Spiritual', color: '#9b59b6', desc: 'Inner peace & purpose' },
          { icon: '◉', label: 'Emotional', color: '#e74c3c', desc: 'Mood & regulation' },
          { icon: '◉', label: 'Physical', color: '#27ae60', desc: 'Sleep, movement & energy' },
          { icon: '◉', label: 'Intellectual', color: '#f39c12', desc: 'Learning & curiosity' },
          { icon: '◉', label: 'Social', color: '#3498db', desc: 'Connection & belonging' },
          { icon: '◉', label: 'Financial', color: '#1abc9c', desc: 'Career & professional life' },
        ].map((d) => (
          <div key={d.label} className={styles.dimension} style={{ '--accent': d.color } as React.CSSProperties}>
            <div className={styles.dimensionDot} />
            <div>
              <div className={styles.dimensionLabel}>{d.label}</div>
              <div className={styles.dimensionDesc}>{d.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Auth card */}
      <section className={styles.authCard}>
        <h2 className={styles.authTitle}>Get started</h2>
        <p className={styles.authSub}>Free 14-day trial. No credit card required to start.</p>

        {isLoading ? (
          <div className={styles.spinner} />
        ) : (
          <div className={styles.authButtons}>
            {AUTH_PROVIDERS.map((p) => (
              <button
                key={p.key}
                className={`${styles.authButton} ${styles[`auth_${p.style}`]}`}
                onClick={() => handleSignIn(p.connection)}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        <p className={styles.terms}>
          By continuing, you agree to Amber's{' '}
          <a href="/terms" className={styles.link}>Terms</a> and{' '}
          <a href="/privacy" className={styles.link}>Privacy Policy</a>.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Amber Technologies Inc.</span>
        <span>Your data stays yours. No ads. No selling.</span>
      </footer>
    </main>
  );
}
