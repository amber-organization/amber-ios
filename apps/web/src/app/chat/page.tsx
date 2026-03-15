'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './chat.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

interface Message {
  role: 'user' | 'amber';
  content: string;
  ts?: string;
}

export default function ChatPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  // Load conversation history
  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/chat/history`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text, channel: 'web' }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'amber', content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'amber', content: "I hit a snag — try again in a moment." },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (isLoading || !user) {
    return (
      <main className={styles.page}>
        <div className={styles.spinner} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.amberAvatar}>A</div>
        <div>
          <div className={styles.headerName}>Amber</div>
          <div className={styles.headerSub}>Your health network</div>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.signOut}
            onClick={() => { window.location.href = '/api/auth/logout'; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {historyLoading ? (
          <div className={styles.historyLoading}>
            <div className={styles.spinnerSmall} />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💛</div>
            <div className={styles.emptyTitle}>Hey{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</div>
            <div className={styles.emptyText}>
              I'm Amber. Tell me something about yourself or someone in your life, and I'll start building your health network.
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAmber}`}>
              {m.content}
            </div>
          ))
        )}
        {sending && (
          <div className={`${styles.bubble} ${styles.bubbleAmber} ${styles.bubbleTyping}`}>
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputBar}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Amber..."
          rows={1}
          disabled={sending}
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </main>
  );
}
