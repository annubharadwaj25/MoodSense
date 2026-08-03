import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/useAuth";
import EmotionDistribution from "../components/sections/EmotionDistribution";
import api from "../services/api";

/* ----------------------------------------------------------------
   Messages array — module-level constant, never causes re-renders.
   Each string is split via [...str] spread inside the component
   so that multi-byte emoji are treated as single characters.
---------------------------------------------------------------- */
const ROTATING_MESSAGES = [
  "🌿 How are you feeling today?",
  "📝 What's on your mind today?",
  "💙 Every emotion deserves to be heard.",
  "📔 Capture today's memories in your journal.",
  "✨ Write freely — this is your safe space.",
  "🧠 Discover your emotions, one thought at a time.",
  "🌸 Every feeling tells a story worth remembering.",
  "😊 Express yourself without hesitation.",
  "📈 Small reflections create meaningful growth.",
  "🌱 Let MoodSense help you understand yourself better.",
];

/* Timing constants — easy to tweak in one place */
const TYPING_SPEED   = 42;   // ms per character (lower = faster)
const HOLD_DURATION  = 1600; // ms to display the full message before fading
const FADE_DURATION  = 420;  // ms fade-out — must match CSS transition

function Dashboard() {
  const { user } = useAuth();

  const [msgIndex,  setMsgIndex]  = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // Three phases drive the entire animation loop
  const [phase, setPhase] = useState("typing"); // "typing" | "holding" | "fading"

  // Pre-split the current message so emoji count as one character each
  const chars   = [...ROTATING_MESSAGES[msgIndex]];
  const visible = chars.slice(0, charIndex).join("");

  useEffect(() => {
    let timer;

    if (phase === "typing") {
      if (charIndex < chars.length) {
        // Reveal the next character after TYPING_SPEED ms
        timer = setTimeout(
          () => setCharIndex((c) => c + 1),
          TYPING_SPEED
        );
      } else {
        // Entire message is typed — move to hold phase
        timer = setTimeout(() => setPhase("holding"), 80);
      }
    }

    if (phase === "holding") {
      // Let the reader absorb the full message, then begin fade-out
      timer = setTimeout(() => setPhase("fading"), HOLD_DURATION);
    }

    if (phase === "fading") {
      // Wait for CSS opacity transition to finish, then advance
      timer = setTimeout(() => {
        setMsgIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
        setCharIndex(0);
        setPhase("typing");
      }, FADE_DURATION);
    }

    return () => clearTimeout(timer); // always clean up
  }, [phase, charIndex, chars.length]);

  useEffect(() => {
    if (!user?.id) return undefined;

    let cancelled = false;

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/api/dashboard");
        if (!cancelled) setStats(response.data);
      } catch {
        if (!cancelled) toast.error("Failed to load dashboard statistics");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    fetchDashboardStats();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const emotionDistribution = stats?.emotionDistribution || [];
  const currentMood = emotionDistribution[0]?.emotion || "No mood yet";
  const journalCount = stats?.journalCount ?? 0;
  const conversationCount = stats?.conversationCount ?? 0;

  return (
    <>
      <Navbar />
      <div className="dashboard-page">

        <h1>📊 Emotion Dashboard</h1>

        {/* Welcome block: Part 1 fixed, Part 2 typewriter-animated */}
        <div className="dashboard-welcome">
          <p className="dashboard-welcome-fixed">
            👋 Welcome back, {user?.username || "User"}!
          </p>
          <p className={`dashboard-welcome-rotating${phase === "fading" ? " fading" : ""}`}>
            {visible}
            {/* Cursor only blinks while actively typing */}
            {phase === "typing" && (
              <span className="tw-cursor" aria-hidden="true" />
            )}
          </p>
        </div>

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="emoji">😊</div>
            <h2>Current Mood</h2>
            <p>{currentMood}</p>
          </div>

          <div className="dashboard-card">
            <div className="emoji">📔</div>
            <h2>Journal Entries</h2>
            <p>{journalCount} {journalCount === 1 ? "Entry" : "Entries"}</p>
          </div>

          <div className="dashboard-card">
            <div className="emoji">🧠</div>
            <h2>Saved Conversations</h2>
            <p>{conversationCount} {conversationCount === 1 ? "Conversation" : "Conversations"}</p>
          </div>

        </div>

        {/* Emotion Distribution — real, aggregated emotion data */}
        <EmotionDistribution
          data={emotionDistribution}
          loading={Boolean(user?.id) && statsLoading}
        />

      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
