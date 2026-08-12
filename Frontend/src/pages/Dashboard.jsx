import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/useAuth";
import EmotionDistribution from "../components/sections/EmotionDistribution";
import api from "../services/api";
import { getEmotionMeta } from "../utils/emotions";

/* ----------------------------------------------------------------
   Wellness Quotes — module-level constant, changes daily
---------------------------------------------------------------- */
const WELLNESS_QUOTES = [
  "🌿 Self-care is not selfish. You cannot serve from an empty vessel.",
  "💙 Be gentle with yourself. You're doing the best you can.",
  "🌸 Every day is a new beginning. Take a deep breath and start again.",
  "✨ Your feelings are valid. Give yourself permission to feel them.",
  "📈 Progress, not perfection. Small steps lead to big changes.",
  "🧠 You are stronger than you think. Trust your journey.",
  "🌱 Growth happens in the quiet moments. Be patient with yourself.",
  "😊 Choose kindness, especially to yourself.",
  "📔 Your story matters. Your reflections shape your growth.",
  "💫 Peace comes from within. Don't look for it outside.",
];

const getDailyQuote = () => {
  const today = new Date().toDateString();
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return WELLNESS_QUOTES[dayOfYear % WELLNESS_QUOTES.length];
};

/* ----------------------------------------------------------------
   Rotating Messages — module-level constant
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

/* Timing constants */
const ROTATION_INTERVAL = 3000; // 3 seconds for message rotation
const FADE_DURATION = 500;

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [msgIndex, setMsgIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  const dailyQuote = getDailyQuote();

  // Message rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
        setIsFading(false);
      }, FADE_DURATION);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Count-up animation for streak
  useEffect(() => {
    if (stats?.streak !== undefined) {
      let current = 0;
      const target = stats.streak;
      const increment = Math.max(1, Math.ceil(target / 30));
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedStreak(target);
          clearInterval(timer);
        } else {
          setAnimatedStreak(current);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stats?.streak]);

  // Count-up animation for journal count
  useEffect(() => {
    if (stats?.journalCount !== undefined) {
      let current = 0;
      const target = stats.journalCount;
      const increment = Math.max(1, Math.ceil(target / 30));
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedCount(target);
          clearInterval(timer);
        } else {
          setAnimatedCount(current);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stats?.journalCount]);

  // Fetch dashboard data
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
  const currentMood = stats?.todayMood || "No mood yet";
  const journalCount = stats?.journalCount ?? 0;
  const conversationCount = stats?.conversationCount ?? 0;
  const streak = stats?.streak ?? 0;
  const latestJournal = stats?.latestJournal;
  const weeklyTrend = stats?.weeklyTrend || [];
  const hasTodayReflection = stats?.hasTodayReflection || false;

  // Generate mood insight
  const generateMoodInsight = () => {
    if (journalCount === 0) {
      return "Start your wellness journey by reflecting on your first emotion today.";
    }
    if (streak >= 7) {
      return `Amazing! You've maintained a ${streak}-day reflection streak. Your consistency is building emotional awareness.`;
    }
    if (streak >= 3) {
      return `Great progress! Your ${streak}-day streak shows commitment to self-reflection.`;
    }
    if (emotionDistribution.length > 0) {
      const dominantEmotion = emotionDistribution[0]?.emotion;
      return `Your most common emotion is ${dominantEmotion}. Understanding patterns helps you grow.`;
    }
    return "Keep reflecting regularly to unlock deeper insights about your emotional patterns.";
  };

  const moodInsight = generateMoodInsight();

  // Get emotion metadata
  const getEmotionEmoji = (emotion) => {
    if (!emotion) return "😊";
    const meta = getEmotionMeta(emotion);
    return meta?.emoji || "😊";
  };

  const getEmotionColor = (emotion) => {
    if (!emotion) return "var(--primary)";
    const meta = getEmotionMeta(emotion);
    return meta?.color || "var(--primary)";
  };

  // Format journal preview
  const getJournalPreview = (text) => {
    if (!text) return "";
    const lines = text.split('\n').slice(0, 2);
    return lines.join(' ').substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page">

        <h1>🌿 Wellness Hub</h1>

        {/* Welcome block with rotating messages */}
        <div className="dashboard-welcome">
          <p className="dashboard-welcome-fixed">
            👋 Welcome back, {user?.username || "User"}!
          </p>
          <p className={`dashboard-welcome-rotating${isFading ? " fading" : ""}`}>
            {ROTATING_MESSAGES[msgIndex]}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <button className="quick-action-btn" onClick={() => navigate("/detect")}>
            <span className="quick-action-icon">🧠</span>
            <span>Reflect</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/journal")}>
            <span className="quick-action-icon">📔</span>
            <span>Write Journal</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/profile")}>
            <span className="quick-action-icon">👤</span>
            <span>View Profile</span>
          </button>
        </div>

        {/* Today's Mood Card */}
        <div className="dashboard-grid">
          <div className="dashboard-card today-mood-card">
            <div className="card-header">
              <h3>Today's Mood</h3>
              <span className="card-icon">{getEmotionEmoji(currentMood)}</span>
            </div>
            {hasTodayReflection ? (
              <div className="today-mood-content">
                <p className="today-mood-emotion" style={{ color: getEmotionColor(currentMood) }}>
                  {currentMood}
                </p>
                <p className="today-mood-message">
                  You've taken time to reflect today. That's wonderful! 🌟
                </p>
              </div>
            ) : (
              <div className="today-mood-empty">
                <p className="empty-message">No reflection yet today</p>
                <button className="reflect-now-btn" onClick={() => navigate("/detect")}>
                  Reflect Now
                </button>
              </div>
            )}
          </div>

          {/* Reflection Streak */}
          <div className="dashboard-card streak-card">
            <div className="card-header">
              <h3>Reflection Streak</h3>
              <span className="card-icon">🔥</span>
            </div>
            <div className="streak-content">
              <p className="streak-number">{animatedStreak}</p>
              <p className="streak-label">
                {streak === 0 ? "Start your streak today!" : 
                 streak === 1 ? "day" : "days"}
              </p>
              {streak > 0 && (
                <p className="streak-message">
                  {streak >= 7 ? "You're on fire! 🔥" :
                   streak >= 3 ? "Keep it going! 💪" :
                   "Great start! 🌱"}
                </p>
              )}
            </div>
          </div>

          {/* Journal Count */}
          <div className="dashboard-card journal-count-card">
            <div className="card-header">
              <h3>Total Reflections</h3>
              <span className="card-icon">📔</span>
            </div>
            <div className="journal-count-content">
              <p className="journal-count-number">{animatedCount}</p>
              <p className="journal-count-label">
                {journalCount === 0 ? "No reflections yet" :
                 journalCount === 1 ? "entry" : "entries"}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Reflection */}
        <div className="dashboard-section">
          <h3 className="section-title">Latest Reflection</h3>
          {latestJournal ? (
            <div className="latest-reflection-card">
              <div className="reflection-header">
                <span className="reflection-emotion" style={{ color: getEmotionColor(latestJournal.emotion) }}>
                  {getEmotionEmoji(latestJournal.emotion)} {latestJournal.emotion}
                </span>
                <span className="reflection-date">
                  {new Date(latestJournal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="reflection-preview">
                {getJournalPreview(latestJournal.content)}
              </p>
              <button 
                className="view-reflection-btn" 
                onClick={() => navigate(`/journal/${latestJournal._id}`)}
              >
                View Reflection
              </button>
            </div>
          ) : (
            <div className="empty-state-card">
              <span className="empty-icon">📝</span>
              <p className="empty-message">No reflections yet</p>
              <p className="empty-submessage">Start your journey by writing your first journal entry</p>
              <button className="empty-action-btn" onClick={() => navigate("/journal")}>
                Write First Journal
              </button>
            </div>
          )}
        </div>

        {/* Mood Insight */}
        <div className="dashboard-section">
          <h3 className="section-title">Mood Insight</h3>
          <div className="insight-card">
            <span className="insight-icon">💡</span>
            <p className="insight-text">{moodInsight}</p>
          </div>
        </div>

        {/* Daily Wellness Quote */}
        <div className="dashboard-section">
          <h3 className="section-title">Daily Wisdom</h3>
          <div className="quote-card">
            <span className="quote-icon">✨</span>
            <p className="quote-text">{dailyQuote}</p>
          </div>
        </div>

        {/* Weekly Mood Trend */}
        <div className="dashboard-section">
          <h3 className="section-title">Weekly Mood Trend</h3>
          <div className="weekly-trend-card">
            <div className="trend-chart">
              {weeklyTrend.map((day, index) => (
                <div key={index} className="trend-day">
                  <div 
                    className="trend-bar" 
                    style={{ 
                      backgroundColor: day.emotion ? getEmotionColor(day.emotion) : 'var(--border)',
                      opacity: day.emotion ? 1 : 0.3
                    }}
                  />
                  <span className="trend-label">{day.date}</span>
                  {day.emotion && (
                    <span className="trend-emoji">{getEmotionEmoji(day.emotion)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emotion Distribution — keep existing pie chart */}
        <div className="dashboard-section">
          <h3 className="section-title">Emotion Distribution</h3>
          <EmotionDistribution
            data={emotionDistribution}
            loading={Boolean(user?.id) && statsLoading}
          />
        </div>

      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
