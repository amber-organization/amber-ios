'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './memories.module.css';

interface Memory {
  id: string;
  date: string;
  content: string;
  summary?: string;
  people: string[];
  source: string;
}

const SOURCE_ICONS: Record<string, { icon: string; label: string }> = {
  manual: { icon: '✏️', label: 'Manual' },
  imessage: { icon: '💬', label: 'iMessage' },
  email: { icon: '📧', label: 'Email' },
  auto: { icon: '🤖', label: 'Auto' },
};

const PRIVACY_OPTIONS = ['private', 'shared', 'public'] as const;

export default function MemoriesPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formContent, setFormContent] = useState('');
  const [formPerson, setFormPerson] = useState('');
  const [formPrivacy, setFormPrivacy] = useState<typeof PRIVACY_OPTIONS[number]>('private');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/memories')
      .then((r) => r.json())
      .then((data) => setMemories(Array.isArray(data) ? data : []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, [user]);

  const allPeople = Array.from(new Set(memories.flatMap((m) => m.people).filter(Boolean)));

  const filtered = memories.filter((m) => {
    const matchSearch = !search || m.content.toLowerCase().includes(search.toLowerCase()) ||
      (m.summary || '').toLowerCase().includes(search.toLowerCase());
    const matchPerson = !filterPerson || m.people.includes(filterPerson);
    const matchSource = !filterSource || m.source === filterSource;
    return matchSearch && matchPerson && matchSource;
  });

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;
    setSubmitting(true);

    const newMemory = {
      content: formContent.trim(),
      people: formPerson.trim() ? [formPerson.trim()] : [],
      privacy: formPrivacy,
      source: 'manual',
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemory),
      });
      const data = await res.json();
      setMemories((prev) => [{ id: data.id || Date.now().toString(), ...newMemory, people: newMemory.people }, ...prev]);
    } catch {
      // optimistic
      setMemories((prev) => [{ id: Date.now().toString(), ...newMemory, people: newMemory.people }, ...prev]);
    }

    setFormContent('');
    setFormPerson('');
    setFormPrivacy('private');
    setSubmitting(false);
    setShowForm(false);
  };

  if (isLoading || !user) {
    return <div className={styles.spinnerPage}><div className={styles.spinner} /></div>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Memories</h1>
          <p className={styles.sub}>{memories.length} entries logged</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add memory
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {allPeople.length > 0 && (
          <select className={styles.filterSelect} value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
            <option value="">All people</option>
            {allPeople.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <select className={styles.filterSelect} value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option value="">All sources</option>
          {Object.entries(SOURCE_ICONS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Memory list */}
      {loading ? (
        <div className={styles.loadingRow}><div className={styles.spinnerSmall} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {memories.length === 0 ? (
            <>No memories yet. <button className={styles.linkBtn} onClick={() => setShowForm(true)}>Add your first one.</button></>
          ) : (
            'No memories match your filters.'
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((m) => {
            const src = SOURCE_ICONS[m.source] || { icon: '📝', label: 'Unknown' };
            return (
              <div key={m.id} className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.srcIcon} title={src.label}>{src.icon}</span>
                  <span className={styles.date}>{m.date}</span>
                  {m.people.length > 0 && (
                    <div className={styles.tags}>
                      {m.people.map((p) => (
                        <span key={p} className={styles.personTag}>{p}</span>
                      ))}
                    </div>
                  )}
                </div>
                {m.summary && m.summary !== m.content && (
                  <p className={styles.summary}>{m.summary}</p>
                )}
                <p className={styles.content}>{m.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add memory form modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add memory</h2>
            <form onSubmit={handleAddMemory} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>What happened?</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe what you want to remember..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Person (optional)</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Mom, Sagar..."
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Privacy</label>
                <select
                  className={styles.select}
                  value={formPrivacy}
                  onChange={(e) => setFormPrivacy(e.target.value as typeof PRIVACY_OPTIONS[number])}
                >
                  {PRIVACY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
