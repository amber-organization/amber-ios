'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './people.module.css';

interface Person {
  id: string;
  name: string;
  type: string;
  lastContact: string;
  strength: number;
}

const MOCK_PEOPLE: Person[] = [
  { id: 'mom', name: 'Mom', type: 'family', lastContact: '2 days ago', strength: 92 },
  { id: 'sagar', name: 'Sagar', type: 'co-founder', lastContact: 'today', strength: 88 },
  { id: 'isaac', name: 'Isaac', type: 'collaborator', lastContact: '3 days ago', strength: 75 },
  { id: 'marcus', name: 'Marcus', type: 'friend', lastContact: '2 weeks ago', strength: 61 },
  { id: 'dr-patel', name: 'Dr. Patel', type: 'doctor', lastContact: '1 month ago', strength: 45 },
];

function isDrifting(lastContact: string): boolean {
  return lastContact.includes('month') || lastContact.includes('week');
}

function getStrengthColor(s: number): string {
  if (s >= 80) return '#27ae60';
  if (s >= 60) return '#f5a623';
  return '#e74c3c';
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function PeoplePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/people')
      .then((r) => r.json())
      .then((data) => {
        setPeople(Array.isArray(data) ? data : MOCK_PEOPLE);
      })
      .catch(() => setPeople(MOCK_PEOPLE))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), type: newType.trim() || 'contact' }),
      });
      const data = await res.json();
      if (data.id) {
        setPeople((prev) => [...prev, { ...data, lastContact: 'just added', strength: 50 }]);
      }
    } catch {
      // optimistic add
      setPeople((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newName.trim(), type: newType.trim() || 'contact', lastContact: 'just added', strength: 50 },
      ]);
    }
    setNewName('');
    setNewType('');
    setSaving(false);
    setShowModal(false);
  };

  if (isLoading || !user) {
    return (
      <div className={styles.spinnerPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Your People</h1>
          <p className={styles.sub}>{people.length} connections tracked</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add person
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by name or relationship..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingRow}><div className={styles.spinnerSmall} /></div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((person) => {
            const drifting = isDrifting(person.lastContact);
            const strengthColor = getStrengthColor(person.strength);
            return (
              <Link key={person.id} href={`/people/${person.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar} style={{ background: `${strengthColor}22`, color: strengthColor }}>
                    {getInitials(person.name)}
                  </div>
                  {drifting && <span className={styles.driftDot} title="No contact in 30+ days" />}
                </div>
                <div className={styles.cardName}>{person.name}</div>
                <div className={styles.cardType}>{person.type}</div>
                <div className={styles.cardContact}>Last contact: {person.lastContact}</div>
                <div className={styles.strengthRow}>
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{ width: `${person.strength}%`, background: strengthColor }}
                    />
                  </div>
                  <span className={styles.strengthNum} style={{ color: strengthColor }}>{person.strength}</span>
                </div>
                <button
                  className={styles.logBtn}
                  onClick={(e) => { e.preventDefault(); router.push('/memories'); }}
                >
                  Log memory
                </button>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add person modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add person</h2>
            <form onSubmit={handleAddPerson} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Alex Chen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Relationship</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. friend, mentor, colleague"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Add person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
