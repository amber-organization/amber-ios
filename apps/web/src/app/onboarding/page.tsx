'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './onboarding.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

const PLANS = [
  {
    key: 'pro_monthly',
    label: 'Pro Monthly',
    price: '$9.99/mo',
    description: 'Full access. Cancel anytime.',
    highlighted: false,
  },
  {
    key: 'pro_annual',
    label: 'Pro Annual',
    price: '$79/yr',
    description: 'Save 34%. Best value.',
    highlighted: true,
  },
] as const;

export default function OnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_annual'>('pro_annual');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const rawPhone = () => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/onboarding/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawPhone(),
          priceKey: selectedPlan,
          successUrl: `${window.location.origin}/welcome`,
          cancelUrl: `${window.location.origin}/onboarding`,
          email: user?.email,
          name: user?.name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start checkout');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
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
      <div className={styles.card}>
        {/* Greeting */}
        <div className={styles.greeting}>
          {user.picture && (
            <img src={user.picture} alt="" className={styles.avatar} />
          )}
          <div>
            <div className={styles.greetingName}>Hey{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</div>
            <div className={styles.greetingEmail}>{user.email}</div>
          </div>
        </div>

        <h1 className={styles.title}>One last step</h1>
        <p className={styles.subtitle}>
          Amber reaches you via iMessage. Enter your phone and choose a plan to get started — 14 days free.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Phone */}
          <div className={styles.field}>
            <label className={styles.label}>Your iPhone number</label>
            <div className={styles.phoneRow}>
              <span className={styles.flag}>+1</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 867-5309"
                className={styles.input}
                maxLength={14}
                required
              />
            </div>
            <p className={styles.hint}>Amber will text this number once your account is active.</p>
          </div>

          {/* Plan selection */}
          <div className={styles.plans}>
            {PLANS.map((plan) => (
              <button
                key={plan.key}
                type="button"
                className={`${styles.plan} ${selectedPlan === plan.key ? styles.planSelected : ''} ${plan.highlighted ? styles.planHighlighted : ''}`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                {plan.highlighted && <span className={styles.badge}>Best value</span>}
                <div className={styles.planLabel}>{plan.label}</div>
                <div className={styles.planPrice}>{plan.price}</div>
                <div className={styles.planDesc}>{plan.description}</div>
              </button>
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? (
              <span className={styles.spinnerInline} />
            ) : (
              'Start 14-day free trial'
            )}
          </button>
        </form>

        <p className={styles.terms}>
          No charge during trial. Cancel anytime. By subscribing you agree to Amber's{' '}
          <a href="/terms">Terms</a>.
        </p>

        <button
          className={styles.signOut}
          onClick={() => { window.location.href = '/api/auth/logout'; }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
