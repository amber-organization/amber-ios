'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface HealthScores {
  physical: number;
  emotional: number;
  social: number;
  financial: number;
  sleep: number;
  overall: number;
}

interface Memory {
  id: string;
  date: string;
  content: string;
  summary?: string;
  people: string[];
  source: string;
}

const MOCK_SCORES: HealthScores = {
  physical: 72,
  emotional: 68,
  social: 81,
  financial: 55,
  sleep: 63,
  overall: 73,
};

const DIMENSIONS: { key: keyof HealthScores; label: string; color: string }[] = [
  { key: 'physical', label: 'Physical', color: '#27ae60' },
  { key: 'emotional', label: 'Emotional', color: '#e74c3c' },
  { key: 'social', label: 'Social', color: '#3498db' },
  { key: 'financial', label: 'Financial', color: '#1abc9c' },
  { key: 'sleep', label: 'Sleep', color: '#9b59b6' },
  { key: 'overall', label: 'Overall', color: '#f5a623' },
];

function CircleGauge({ value, color, size = 72 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const SOURCE_ICONS: Record<string, string> = {
  manual: '✏️',
  imessage: '💬',
  email: '📧',
  auto: '🤖',
};

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [scores, setScores] = useState<HealthScores>(MOCK_SCORES);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/health-scores').then((r) => r.json()).catch(() => MOCK_SCORES),
      fetch('/api/memories').then((r) => r.json()).catch(() => []),
    ]).then(([s, m]) => {
      if (s && typeof s.overall === 'number') setScores(s);
      if (Array.isArray(m)) setMemories(m.slice(0, 5));
      setLoadingData(false);
    });
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className={styles.spinnerPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] || 'there';
  const overallDim = DIMENSIONS.find((d) => d.key === 'overall')!;

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, {firstName}</h1>
          <p className={styles.greetingSub}>Here is your health snapshot for today.</p>
        </div>
        <div className={styles.overallBadge}>
          <CircleGauge value={scores.overall} color={overallDim.color} size={56} />
          <div className={styles.overallNum}>{scores.overall}</div>
        </div>
      </div>

      {/* Health score cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Health Dimensions</h2>
        <div className={styles.scoresGrid}>
          {DIMENSIONS.filter((d) => d.key !== 'overall').map((dim) => (
            <Link key={dim.key} href="/health" className={styles.scoreCard}>
              <div className={styles.scoreGaugeWrap}>
                <CircleGauge value={scores[dim.key]} color={dim.color} size={64} />
                <span className={styles.scoreNum} style={{ color: dim.color }}>{scores[dim.key]}</span>
              </div>
              <div className={styles.scoreLabel}>{dim.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Amber Summary</h2>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 1 0 9 9"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <p className={styles.summaryText}>
            Your social dimension is your strongest this week at {scores.social}/100. Financial health needs the most attention.
            Consider logging a conversation with someone you have not reached out to recently.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/memories" className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Log memory
          </Link>
          <Link href="/people" className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            View people
          </Link>
          <Link href="/chat" className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Open chat
          </Link>
          <Link href="/health" className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Check signals
          </Link>
        </div>
      </section>

      {/* Recent memories */}
      <section className={styles.section}>
        <div className={styles.sectionRow}>
          <h2 className={styles.sectionTitle}>Recent Memories</h2>
          <Link href="/memories" className={styles.seeAll}>See all</Link>
        </div>
        {loadingData ? (
          <div className={styles.loadingRow}><div className={styles.spinnerSmall} /></div>
        ) : memories.length === 0 ? (
          <div className={styles.emptyMemories}>No memories yet. <Link href="/memories" className={styles.link}>Add your first one.</Link></div>
        ) : (
          <div className={styles.memoriesList}>
            {memories.map((m) => (
              <div key={m.id} className={styles.memoryItem}>
                <div className={styles.memoryMeta}>
                  <span className={styles.memorySource}>{SOURCE_ICONS[m.source] || '📝'}</span>
                  <span className={styles.memoryDate}>{m.date}</span>
                  {m.people.length > 0 && (
                    <span className={styles.memoryPeople}>{m.people.join(', ')}</span>
                  )}
                </div>
                <p className={styles.memoryContent}>{m.summary || m.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
