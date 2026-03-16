"use client";

type Tab = "home" | "connect" | "activities" | "me";

interface TabBarProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "connect", label: "Connect" },
  { id: "activities", label: "Activities" },
  { id: "me", label: "Me" },
];

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(244,114,182,0.95)" : "rgba(255,255,255,0.35)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10.5L11 3l8 7.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V10.5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ConnectIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(244,114,182,0.95)" : "rgba(255,255,255,0.35)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="9" r="3" stroke={c} strokeWidth="1.6" />
      <path d="M2 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 7c1.657 0 3 1.343 3 3s-1.343 3-3 3" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 13c1.5 0 4 1.5 4 4.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ActivitiesIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(244,114,182,0.95)" : "rgba(255,255,255,0.35)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6" />
      <rect x="12" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6" />
      <rect x="3" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6" />
      <rect x="12" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6" />
    </svg>
  );
}

function MeIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(244,114,182,0.95)" : "rgba(255,255,255,0.35)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7.5" r="3.5" stroke={c} strokeWidth="1.6" />
      <path d="M4 19c0-3.866 3.134-7 7-7h.0c3.866 0 7 3.134 7 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav role="tablist" aria-label="Main navigation" style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "80px",
      background: "linear-gradient(to top, rgba(3,1,7,0.98) 60%, rgba(3,1,7,0.0) 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "space-around",
      paddingTop: "10px",
      zIndex: 50,
    }}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(tab.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
              color: isActive ? "rgba(244,114,182,0.95)" : "rgba(255,255,255,0.35)",
              fontSize: "10px", fontWeight: isActive ? 600 : 500,
              fontFamily: "var(--font-inter), sans-serif",
              letterSpacing: "0.02em", transition: "color 0.15s ease",
              minHeight: "44px",
            }}
          >
            {tab.id === "home" && <HomeIcon active={isActive} />}
            {tab.id === "connect" && <ConnectIcon active={isActive} />}
            {tab.id === "activities" && <ActivitiesIcon active={isActive} />}
            {tab.id === "me" && <MeIcon active={isActive} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
