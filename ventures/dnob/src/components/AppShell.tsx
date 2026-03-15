"use client";
import { useState, useCallback, useRef, Component, ReactNode, ErrorInfo } from "react";
import SplashScreen from "@/components/screens/SplashScreen";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import HomeScreen from "@/components/screens/HomeScreen";
import CookDashboardScreen from "@/components/screens/CookDashboardScreen";
import CookProfileScreen from "@/components/screens/CookProfileScreen";
import MealDetailScreen from "@/components/screens/MealDetailScreen";
import CheckoutScreen from "@/components/screens/CheckoutScreen";
import OrderActiveScreen from "@/components/screens/OrderActiveScreen";
import RatingScreen from "@/components/screens/RatingScreen";

// ─── Error Boundary ────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[D-NOB] Uncaught error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100%", height: "100%", background: "#030107",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "12px", padding: "24px",
          fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="rgba(244,114,182,0.7)" strokeWidth="1.6" />
              <path d="M11 7v5M11 14.5v.5" stroke="rgba(244,114,182,0.85)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", textAlign: "center" }}>
            Something went wrong
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.5 }}>
            An error occurred in D-NOB. Tap below to restart.
          </div>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              marginTop: "8px", height: "44px", padding: "0 24px",
              background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)",
              borderRadius: "12px", cursor: "pointer",
              fontSize: "14px", fontWeight: 600, color: "rgba(244,114,182,0.9)",
              fontFamily: "inherit",
            }}
          >
            Restart App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Navigation types ─────────────────────────────────────────────────────────

type ScreenState =
  | { name: "splash" }
  | { name: "onboarding" }
  | { name: "home" }
  | { name: "activityDetail"; activityId: string }
  | { name: "friendProfile"; peerId: string }
  | { name: "joinActivity"; activityId: string }
  | { name: "liveRoom"; activityId: string }
  | { name: "moodCheckin"; peerId: string }
  | { name: "myRoom"; staffId: string };

// ─── AppShell ─────────────────────────────────────────────────────────────────

export default function AppShell() {
  const [stack, setStack] = useState<ScreenState[]>([{ name: "splash" }]);
  const isPushRef = useRef(false);
  const [transitionClass, setTransitionClass] = useState("");

  const current = stack[stack.length - 1];

  const push = useCallback((screen: ScreenState) => {
    isPushRef.current = true;
    setTransitionClass("screen-forward");
    setStack((s) => [...s, screen]);
  }, []);

  const pop = useCallback(() => {
    isPushRef.current = false;
    setTransitionClass("screen-back");
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const reset = useCallback(() => {
    isPushRef.current = false;
    setTransitionClass("");
    setStack([{ name: "home" }]);
  }, []);

  const resetToSplash = useCallback(() => {
    isPushRef.current = false;
    setTransitionClass("");
    setStack([{ name: "splash" }]);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#030107",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
      }}
    >
      <ErrorBoundary>
        <div
          key={
            current.name +
            ("activityId" in current ? current.activityId : "") +
            ("peerId" in current ? current.peerId : "") +
            ("staffId" in current ? current.staffId : "")
          }
          className={current.name !== "splash" ? transitionClass : ""}
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        >
          {current.name === "splash" && (
            <SplashScreen
              onContinue={() => {
                const onboarded = typeof window !== "undefined" && localStorage.getItem("dnob_onboarded") === "1";
                push({ name: onboarded ? "home" : "onboarding" });
              }}
              onCookLogin={(staffId) => push({ name: "myRoom", staffId })}
            />
          )}

          {current.name === "onboarding" && (
            <OnboardingScreen
              onComplete={() => push({ name: "home" })}
            />
          )}

          {current.name === "home" && (
            <HomeScreen
              onSelectDrop={(peerId) => push({ name: "friendProfile", peerId })}
              onSelectCook={(staffId) => push({ name: "myRoom", staffId })}
            />
          )}

          {current.name === "friendProfile" && (
            <CookProfileScreen
              cookId={current.peerId}
              onBack={pop}
              onOrderFromCook={(activityId) => push({ name: "activityDetail", activityId })}
            />
          )}

          {current.name === "activityDetail" && (
            <MealDetailScreen
              dropId={current.activityId}
              onBack={pop}
              onOrder={(activityId) => push({ name: "joinActivity", activityId })}
              onViewCook={(staffId) => push({ name: "myRoom", staffId })}
            />
          )}

          {current.name === "joinActivity" && (
            <CheckoutScreen
              dropId={current.activityId}
              onBack={pop}
              onConfirm={() => {
                const activityId = current.activityId;
                setStack((s) => [...s, { name: "liveRoom", activityId }]);
              }}
            />
          )}

          {current.name === "liveRoom" && (
            <OrderActiveScreen
              dropId={current.activityId}
              onViewRating={() => {
                const peerId = "peer2";
                setStack((s) => [...s, { name: "moodCheckin", peerId }]);
              }}
            />
          )}

          {current.name === "moodCheckin" && (
            <RatingScreen
              dropId={current.peerId}
              onSubmit={reset}
            />
          )}

          {current.name === "myRoom" && (
            <CookDashboardScreen
              cookId={current.staffId}
              onBack={resetToSplash}
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
