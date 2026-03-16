'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './person.module.css';

interface Person {
  id: string;
  name: string;
  type: string;
  lastContact: string;
  strength: number;
}

interface Memory {
  id: string;
  date: string;
  content: string;
  summary?: string;
  people: string[];
  source: string;
}

const MOCK_PEOPLE: Person[] = [
  { id: 'mom', name: 'Mom', type: 'family', lastContact: '2 days ago', strength: 92 },
  { id: 'sagar', name: 'Sagar', type: 'co-founder', lastContact: 'today', strength: 88 },
  { id: 'isaac', name: 'Isaac', type: 'collaborator', lastContact: '3 days ago', strength: 75 },
  { id: 'marcus', name: 'Marcus', type: 'friend', lastContact: '2 weeks ago', strength: 61 },
  { id: 'dr-patel', name: 'Dr. Patel', type: 'doctor', lastContact: '1 month ago', strength: 45 },
];

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function getStrengthColor(s: number): string {
  if (s >= 80) return '#27ae60';
  if (s >= 60) return '#f5a623';
  return '#e74c3c';
}

export default function PersonDetailPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const personId = params?.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !personId) return;
    // Find person from list + filter memories for this person
    Promise.all([
      fetch('/api/people').then((r) => r.json()).catch(() => MOCK_PEOPLE),
      fetch('/api/memories').then((r) => r.json()).catch(() => []),
    ]).then(([people, allMemories]) => {
      const list: Person[] = Array.isArray(people) ? people : MOCK_PEOPLE;
      const found = list.find((p) => p.id === personId) || MOCK_PEOPLE.find((p) => p.id === personId) || null;
      setPerson(found);
      if (found && Array.isArray(allMemories)) {
        setMemories(allMemories.filter((m: Memory) =>
          m.people?.some((name: string) => name.toLowerCase() === found.name.toLowerCase())
        ));
      }
      setLoading(false);
    });
  }, [user, personId]);

  if (isLoading || !user) {
    return <div className={styles.spinnerPage}><div className={styles.spinner} /></div>;
  }

  if (!loading && !person) {
    return (
      <main className={styles.page}>
        <Link href="/people" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to People
        </Link>
        <p className={styles.notFound}>Person not found.</p>
      </main>
    );
  }

  if (loading || !person) {
    return <div className={styles.spinnerPage}><div className={styles.spinner} /></div>;
  }

  const strengthColor = getStrengthColor(person.strength);

  return (
    <main className={styles.page}>
      <Link href="/people" className={styles.back}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to People
      </Link>

      {/* Person header */}
      <div className={styles.personHeader}>
        <div className={styles.avatar} style={{ background: `${strengthColor}22`, color: strengthColor }}>
          {getInitials(person.name)}
        </div>
        <div>
          <h1 className={styles.name}>{person.name}</h1>
          <p className={styles.type}>{person.type}</p>
          <p className={styles.contact}>Last contact: {person.lastContact}</p>
        </div>
        <div className={styles.strengthBadge}>
          <span className={styles.strengthLabel}>Connection</span>
          <span className={styles.strengthValue} style={{ color: strengthColor }}>{person.strength}</span>
        </div>
      </div>

      {/* Strength bar */}
      <div className={styles.strengthBar}>
        <div className={styles.strengthFill} style={{ width: `${person.strength}%`, background: strengthColor }} />
      </div>

      {/* Memory timeline */}
      <div className={styles.timelineHeader}>
        <h2 className={styles.sectionTitle}>Memory Timeline</h2>
        <Link href="/memories" className={styles.addLink}>Add memory</Link>
      </div>

      {memories.length === 0 ? (
        <div className={styles.emptyTimeline}>
          No memories logged with {person.name} yet.{' '}
          <Link href="/memories" className={styles.link}>Log one now.</Link>
        </div>
      ) : (
        <div className={styles.timeline}>
          {memories.map((m) => (
            <div key={m.id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineDate}>{m.date}</div>
                <p className={styles.timelineText}>{m.summary || m.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
