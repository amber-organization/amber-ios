'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import styles from './nav.module.css';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/people',
    label: 'People',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/memories',
    label: 'Memories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 1 0 9 9"/>
        <path d="M12 6v6l4 2"/>
        <circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: '/health',
    label: 'Health',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    href: '/integrations',
    label: 'Integrations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const AUTHENTICATED_PATHS = ['/dashboard', '/people', '/memories', '/health', '/integrations', '/chat'];

export default function Nav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAuthPage = AUTHENTICATED_PATHS.some((p) => pathname?.startsWith(p));
  if (!isAuthPage || !user) return null;

  const firstName = user.name?.split(' ')[0] || 'You';

  return (
    <nav className={styles.nav}>
      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#f5a623" opacity="0.15"/>
            <circle cx="12" cy="12" r="6" fill="#f5a623" opacity="0.35"/>
            <circle cx="12" cy="12" r="3" fill="#f5a623"/>
          </svg>
        </div>
        <span className={styles.logoText}>Amber</span>
      </Link>

      {/* Nav items */}
      <div className={styles.navItems}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom: user + settings */}
      <div className={styles.navBottom}>
        <div className={styles.userRow}>
          {user.picture ? (
            <img src={user.picture} alt="" className={styles.userAvatar} />
          ) : (
            <div className={styles.userAvatarFallback}>{firstName[0]}</div>
          )}
          <div className={styles.userInfo}>
            <div className={styles.userName}>{firstName}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>
        <button
          className={styles.signOutBtn}
          onClick={() => { window.location.href = '/api/auth/logout'; }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
