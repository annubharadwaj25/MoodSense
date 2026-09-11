import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Spinner from "../components/ui/Spinner";
import ProcessingStatus, { waitForPaint } from "../components/ui/ProcessingStatus";
import "./Journal.css";

const EMOJI_MAP = {
  Happy: "😊",
  Sad: "😔",
  Calm: "😌",
  Angry: "😠",
  Anxious: "😟",
  Excited: "🤩",
  Neutral: "😐",
  Stressed: "😣",
  Fear: "😨",
};

function Journal() {
  const navigate = useNavigate();
  const location = useLocation();
  const reflectionResult = location.state?.reflectionResult || null;
  const [entry, setEntry] = useState(
    () => localStorage.getItem("journalPrefill") || ""
  );
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimerRef = useRef(null);

  useEffect(() => {
    // Consume prefill before first render
    localStorage.removeItem("journalPrefill");

    const fetchJournals = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) return;
        const response = await api.get(`/api/journal/${user.id}`);
        const journals = Array.isArray(response.data) ? response.data : [];
        setJournals(journals);
      } catch {
        toast.error("Failed to load journals");
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const saveJournal = async () => {
    if (entry.trim() === "") {
      toast.error("Please write something first 😊");
      return;
    }

    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await api.post("/api/journal", {
        userId: user.id,
        entry: entry.trim(),
      });

      setJournals((prev) => [response.data.journal, ...prev]);
      setEntry("");
      setSaveSuccess(true);
      await waitForPaint();
      successTimerRef.current = setTimeout(() => setSaveSuccess(false), 2200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save journal");
    } finally {
      setSaving(false);
    }
  };

  const deleteJournal = async (journalId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this journal entry?")) return;

    try {
      await api.delete(`/api/journal/${journalId}`);
      toast.success("Journal deleted");
      setJournals(journals.filter((j) => j._id !== journalId));
    } catch {
      toast.error("Failed to delete journal");
    }
  };

  return (
    <>
      <Navbar />
      <main className="journal-page">
        <div className="journal-container">
          <header className="journal-header">
            {reflectionResult && (
              <button
                type="button"
                className="journal-back-reflection-btn"
                onClick={() => navigate("/detect", { state: { restoredResult: reflectionResult } })}
              >
                ← Back to Reflection
              </button>
            )}
            <span className="journal-eyebrow">Personal Reflections</span>
            <h1>📔 Daily Journal</h1>
            <p>
              A peaceful space to capture your thoughts, emotions and memories every day.
            </p>
          </header>

          <div className="journal-layout">
            {/* LEFT — Previous Entries */}
            <section className="journal-section journal-sidebar">
              <div className="journal-section-head">
                <h2>📅 Previous Entries</h2>
                <span className="journal-count-badge">
                  {journals.length} {journals.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {loading ? (
                <div className="journal-loading">
                  <Spinner size={28} />
                  <span>Loading your entries...</span>
                </div>
              ) : journals.length === 0 ? (
                <div className="empty-journal">
                  <span className="empty-icon">🌿</span>
                  <h3>No journal entries yet</h3>
                  <p>Write your first entry today to start tracking your thoughts.</p>
                </div>
              ) : (
                <div className="journal-list">
                  {journals.map((journal) => {
                    const formattedDate = new Date(journal.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    );

                    return (
                      <article
                        key={journal._id}
                        className="journal-card"
                        onClick={() => navigate(`/journal/${journal._id}`)}
                      >
                        <div className="journal-card-left">
                          <span className="journal-card-icon">📅</span>
                          <time className="journal-card-date">{formattedDate}</time>
                        </div>

                        <div className="journal-card-right">
                          {journal.emotion && (
                            <span className="journal-emotion-tag">
                              {EMOJI_MAP[journal.emotion] || "✨"} {journal.emotion}
                            </span>
                          )}
                          <button
                            type="button"
                            className="journal-delete-btn"
                            onClick={(e) => deleteJournal(journal._id, e)}
                            title="Delete entry"
                            aria-label="Delete entry"
                          >
                            🗑️
                          </button>
                          <span className="journal-card-arrow">→</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* RIGHT — Editor */}
            <section className="journal-section journal-editor">
              <div className="journal-section-head">
                <h2>✍️ Today's Journal</h2>
              </div>

              <div className="journal-textarea-wrapper">
                <textarea
                  className="journal-textarea"
                  placeholder="How are you feeling today? Share your thoughts, reflections, or moments..."
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  maxLength={1000}
                  disabled={saving}
                />
                <div className="character-count">
                  {entry.length}/1000 characters
                </div>
              </div>

              <div className="journal-process-slot">
                {saving && (
                  <ProcessingStatus
                    headline="Saving your reflection..."
                    detail="Understanding the mood behind your words."
                  />
                )}
                {!saving && saveSuccess && (
                  <ProcessingStatus success headline="Journal saved" />
                )}
              </div>

              <button
                type="button"
                className="journal-save-btn"
                onClick={saveJournal}
                disabled={saving || saveSuccess || entry.trim().length === 0}
                aria-busy={saving}
              >
                {saving ? (
                  <span>Saving entry…</span>
                ) : saveSuccess ? (
                  <span>Journal saved</span>
                ) : (
                  <span>💾 Save Entry</span>
                )}
              </button>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Journal;
