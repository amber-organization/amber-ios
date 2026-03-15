'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './health.module.css';

interface HealthScores {
  physical: number;
  emotional: number;
  social: number;
  financial: number;
  sleep: number;
  overall: number;
}

const MOCK_SCORES: HealthScores = {
  physical: 72,
  emotional: 68,
  social: 81,
  financial: 55,
  sleep: 63,
  overall: 73,
};

// 7-day mock history per dimension (oldest to newest)
const MOCK_HISTORY: Record<keyof HealthScores, number[]> = {
  physical: [65, 68, 70, 71, 69, 72, 72],
  emotional: [60, 62, 65, 63, 67, 68, 68],
  social: [78, 79, 80, 80, 81, 81, 81],
  financial: [58, 57, 56, 55, 55, 54, 55],
  sleep: [55, 58, 60, 62, 61, 63, 63],
  overall: [68, 70, 71, 72, 72, 73, 73],
};

const DIMENSIONS: { key: keyof HealthScores; label: string; color: string; insight: string }[] = [
  {
    key: 'physical',
    label: 'Physical',
    color: '#27ae60',
    insight: 'Movement and sleep are improving. Keep the morning routine consistent.',
  },
  {
    key: 'emotional',
    label: 'Emotional',
    color: '#e74c3c',
    insight: 'Stress signals detected mid-week. More social interactions could help.',
  },
  {
    key: 'social',
    label: 'Social',
    color: '#3498db',
    insight: 'Your strongest dimension. You have been connecting well with close contacts.',
  },
  {
    key: 'financial',
    label: 'Financial',
    color: '#1abc9c',
    insight: 'Slight downward trend this week. Consider reviewing open tasks in FiduciaryOS.',
  },
  {
    key: 'sleep',
    label: 'Sleep',
    color: '#9b59b6',
    insight: 'Sleep quality is improving slowly. Aim for consistent bedtimes.',
  },
];

const INTEGRATIONS: { id: string; name: string; dimension: keyof HealthScores; connected: boolean; lastSync?: string }[] = [
  { id: 'clearout', name: 'ClearOut', dimension: 'physical', connected: false },
  { id: 'fiduciaryos', name: 'FiduciaryOS', dimension: 'financial', connected: false },
  { id: 'marrow', name: 'Marrow', dimension: 'social', connected: false },
  { id: 'story', name: 'Story', dimension: 'emotional', connected: false },
  { id: 'dnob', name: 'D-NOB', dimension: 'physical', connected: false },
  { id: 'medbridge', name: 'MedBridge', dimension: 'sleep', connected: false },
];

function CircleGauge({ value, color, size = 120 }: { value: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 100);
  return (
    <div className={styles.miniBar}>
      {values.map((v, i) => (
        <div
          key={i}
          className={styles.miniBarSegment}
          style={{ height: `${(v / max) * 100}%`, background: i === values.length - 1 ? color : `${color}55` }}
        />
      ))}
    </div>
  );
}

export default function HealthPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [scores, setScores] = useState<HealthScores>(MOCK_SCORES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/health-scores')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.overall === 'number') setScores(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) {
    return <div className={styles.spinnerPage}><div className={styles.spinner} /></div>;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Health</h1>
      <p className={styles.sub}>Your six dimensions, tracked over time.</p>

      {/* Overall score */}
      <div className={styles.overallCard}>
        <div className={styles.overallGaugeWrap}>
          <CircleGauge value={scores.overall} color="#f5a623" size={130} />
          <div className={styles.overallCenter}>
            <span className={styles.overallNum}>{loading ? '--' : scores.overall}</span>
            <span className={styles.overallLabel}>Overall</span>
          </div>
        </div>
        <div className={styles.overallRight}>
          <div className={styles.overallInsight}>
            Your overall health score is <strong style={{ color: '#f5a623' }}>{scores.overall}/100</strong>. Social is your
            strongest dimension this week. Financial wellbeing needs the most attention. Stay consistent and your score will rise.
          </div>
          <Link href="/integrations" className={styles.connectLink}>
            Connect integrations to improve accuracy
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Dimension breakdown */}
      <h2 className={styles.sectionTitle}>Dimensions</h2>
      <div className={styles.dimensionsGrid}>
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className={styles.dimCard}>
            <div className={styles.dimTop}>
              <div>
                <div className={styles.dimLabel}>{dim.label}</div>
                <div className={styles.dimScore} style={{ color: dim.color }}>{scores[dim.key]}</div>
              </div>
              <MiniBar values={MOCK_HISTORY[dim.key]} color={dim.color} />
            </div>
            <div className={styles.dimBar}>
              <div
                className={styles.dimFill}
                style={{ width: `${scores[dim.key]}%`, background: dim.color }}
              />
            </div>
            <p className={styles.dimInsight}>{dim.insight}</p>
          </div>
        ))}
      </div>

      {/* Integration status */}
      <h2 className={styles.sectionTitle}>Integration Status</h2>
      <div className={styles.integGrid}>
        {INTEGRATIONS.map((intg) => {
          const dim = DIMENSIONS.find((d) => d.key === intg.dimension);
          return (
            <div key={intg.id} className={styles.integCard}>
              <div className={styles.integTop}>
                <div className={styles.integIcon} style={{ background: `${dim?.color || '#888'}22`, color: dim?.color || '#888' }}>
                  {intg.name[0]}
                </div>
                <div>
                  <div className={styles.integName}>{intg.name}</div>
                  <div className={styles.integDim} style={{ color: dim?.color }}>{dim?.label}</div>
                </div>
                <div className={`${styles.statusDot} ${intg.connected ? styles.connected : styles.disconnected}`} />
              </div>
              <div className={styles.integStatus}>
                {intg.connected ? (
                  <span className={styles.connectedBadge}>Connected</span>
                ) : (
                  <Link href="/integrations" className={styles.connectBtn}>Connect</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
