'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './integrations.module.css';

interface Integration {
  id: string;
  name: string;
  description: string;
  dimension: string;
  dimensionColor: string;
  connected: boolean;
  lastSync?: string;
  healthImpact?: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'clearout',
    name: 'ClearOut',
    description: 'Track your physical health habits, movement, and energy levels.',
    dimension: 'Physical',
    dimensionColor: '#27ae60',
    connected: false,
    healthImpact: '+12 pts when active',
  },
  {
    id: 'fiduciaryos',
    name: 'FiduciaryOS',
    description: 'Financial wellbeing and career clarity. Tracks income, goals, and growth.',
    dimension: 'Financial',
    dimensionColor: '#1abc9c',
    connected: false,
    healthImpact: '+18 pts when active',
  },
  {
    id: 'marrow',
    name: 'Marrow',
    description: 'Relationship health with your community and social circle.',
    dimension: 'Social',
    dimensionColor: '#3498db',
    connected: false,
    healthImpact: '+8 pts when active',
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Emotional and spiritual journaling. Surfaces patterns in your mental state.',
    dimension: 'Emotional',
    dimensionColor: '#e74c3c',
    connected: false,
    healthImpact: '+15 pts when active',
  },
  {
    id: 'dnob',
    name: 'D-NOB',
    description: 'Nutritional awareness and body composition tracking.',
    dimension: 'Physical',
    dimensionColor: '#27ae60',
    connected: false,
    healthImpact: '+9 pts when active',
  },
  {
    id: 'medbridge',
    name: 'MedBridge',
    description: 'Sleep tracking, health records, and medical history.',
    dimension: 'Sleep',
    dimensionColor: '#9b59b6',
    connected: false,
    healthImpact: '+20 pts when active',
  },
  {
    id: 'tally',
    name: 'Tally',
    description: 'Habit tracking for daily rituals and goal consistency.',
    dimension: 'Emotional',
    dimensionColor: '#e74c3c',
    connected: false,
    healthImpact: '+7 pts when active',
  },
  {
    id: 'babel',
    name: 'Babel',
    description: 'Communication health — reflects quality of your digital relationships.',
    dimension: 'Social',
    dimensionColor: '#3498db',
    connected: false,
    healthImpact: '+11 pts when active',
  },
];

const DIMENSION_COLORS: Record<string, string> = {
  Physical: '#27ae60',
  Financial: '#1abc9c',
  Social: '#3498db',
  Emotional: '#e74c3c',
  Sleep: '#9b59b6',
};

export default function IntegrationsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    // Simulate connection flow
    await new Promise((r) => setTimeout(r, 1200));
    setIntegrations((prev) =>
      prev.map((intg) =>
        intg.id === id
          ? { ...intg, connected: !intg.connected, lastSync: intg.connected ? undefined : 'Just now' }
          : intg
      )
    );
    setConnecting(null);
  };

  if (isLoading || !user) {
    return <div className={styles.spinnerPage}><div className={styles.spinner} /></div>;
  }

  const connected = integrations.filter((i) => i.connected);
  const disconnected = integrations.filter((i) => !i.connected);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Integrations</h1>
          <p className={styles.sub}>{connected.length} of {integrations.length} connected</p>
        </div>
      </div>

      {/* Summary bar */}
      <div className={styles.summaryBar}>
        {Object.entries(DIMENSION_COLORS).map(([dim, color]) => {
          const total = integrations.filter((i) => i.dimension === dim).length;
          const active = integrations.filter((i) => i.dimension === dim && i.connected).length;
          return (
            <div key={dim} className={styles.dimSummary}>
              <div className={styles.dimDot} style={{ background: color }} />
              <div className={styles.dimSummaryLabel} style={{ color }}>{dim}</div>
              <div className={styles.dimSummaryCount}>{active}/{total}</div>
            </div>
          );
        })}
      </div>

      {/* Connected section */}
      {connected.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Connected</h2>
          <div className={styles.grid}>
            {connected.map((intg) => (
              <IntegrationCard
                key={intg.id}
                intg={intg}
                connecting={connecting === intg.id}
                onToggle={() => handleConnect(intg.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Available section */}
      <h2 className={styles.sectionTitle}>{connected.length > 0 ? 'Available' : 'All integrations'}</h2>
      <div className={styles.grid}>
        {disconnected.map((intg) => (
          <IntegrationCard
            key={intg.id}
            intg={intg}
            connecting={connecting === intg.id}
            onToggle={() => handleConnect(intg.id)}
          />
        ))}
      </div>
    </main>
  );
}

function IntegrationCard({
  intg,
  connecting,
  onToggle,
}: {
  intg: Integration;
  connecting: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`${styles.card} ${intg.connected ? styles.cardConnected : ''}`}>
      <div className={styles.cardTop}>
        <div
          className={styles.cardIcon}
          style={{ background: `${intg.dimensionColor}20`, color: intg.dimensionColor }}
        >
          {intg.name[0]}
        </div>
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{intg.name}</div>
          <span
            className={styles.dimTag}
            style={{ color: intg.dimensionColor, background: `${intg.dimensionColor}15`, border: `1px solid ${intg.dimensionColor}30` }}
          >
            {intg.dimension}
          </span>
        </div>
        {intg.connected && <div className={styles.connectedDot} />}
      </div>

      <p className={styles.cardDesc}>{intg.description}</p>

      {intg.healthImpact && (
        <div className={styles.impact}>{intg.healthImpact}</div>
      )}

      <div className={styles.cardBottom}>
        {intg.connected && intg.lastSync && (
          <span className={styles.lastSync}>Last sync: {intg.lastSync}</span>
        )}
        <button
          className={`${styles.toggleBtn} ${intg.connected ? styles.disconnectBtn : styles.connectBtn}`}
          onClick={onToggle}
          disabled={connecting}
        >
          {connecting ? (
            <span className={styles.spinnerInline} />
          ) : intg.connected ? (
            'Disconnect'
          ) : (
            'Connect'
          )}
        </button>
      </div>
    </div>
  );
}
