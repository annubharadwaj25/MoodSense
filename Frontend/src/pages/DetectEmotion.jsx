import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Spinner from "../components/ui/Spinner";
import MoodCompanion from "../components/chat/MoodCompanion";
import DetectResultCard from "../components/detect/DetectResultCard";
import DetectSuggestionCard from "../components/detect/DetectSuggestionCard";
import DetectErrorCard from "../components/detect/DetectErrorCard";
import api from "../services/api";
import { getSuggestion } from "../utils/suggestions";
import "./DetectEmotion.css";

const AUTO_CLEAR_DELAY = 1800;
const LOADING_DELAY = 2500;

function DetectEmotion() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const canAnalyze = text.trim().length > 0 && !loading;
  const suggestion = result ? getSuggestion(result.emotion) : null;
  
  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.username || "friend";

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please write something first 😊");
      return;
    }

    const submittedText = text.trim();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/api/detect", { text: submittedText });

      // Add artificial delay for smooth loading experience
      await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));

      setResult({
        emotion: res.data.emotion,
        confidence: res.data.confidence,
        timestamp: res.data.timestamp,
        originalText: submittedText,
      });
      setSessionKey((k) => k + 1);

      setTimeout(() => setText(""), AUTO_CLEAR_DELAY);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewReflection = () => {
    setText("");
    setResult(null);
    setError("");
    setSessionKey((k) => k + 1);
    setShowEncouragement(false);
  };

  const handleContinueToJournal = () => {
    // Show encouraging message first
    setShowEncouragement(true);
    
    // Store the original text for pre-filling the journal
    if (result && result.originalText) {
      localStorage.setItem("journalPrefill", result.originalText);
    }
    
    // Navigate after 1 second
    setTimeout(() => {
      navigate("/journal");
    }, 1000);
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (value.length > 0 && (result || error)) {
      setResult(null);
      setError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (canAnalyze) handleAnalyze();
    }
  };

  return (
    <>
      <Navbar />
      <main className="detect-page">
        <div className="detect-container">
          <header className="detect-header">
            <h1>🧠 Detect Your Emotion</h1>
            <p>
              Write your thoughts and our AI will gently analyze how you&apos;re
              feeling.
            </p>
          </header>

          <div className="detect-input-section">
            <textarea
              className="detect-textarea"
              placeholder="Write anything that's on your mind today..."
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              maxLength={5000}
              disabled={loading}
              aria-label="Describe how you are feeling"
            />

            <div className="detect-actions">
              <button
                type="button"
                className="detect-btn"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Spinner size={18} color="var(--cream)" />
                    <span>Analyzing your emotions...</span>
                  </>
                ) : (
                  <span>✨ Analyze Mood</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <DetectErrorCard message={error} />
          )}

          {result && (
            <div className="detect-results">
              <DetectResultCard
                emotion={result.emotion}
                confidence={result.confidence}
                timestamp={result.timestamp}
              />

              <DetectSuggestionCard suggestion={suggestion} />

              <MoodCompanion
                key={sessionKey}
                initialEmotion={result.emotion}
                originalText={result.originalText}
                userName={userName}
              />

              {showEncouragement && (
                <div className="detect-encouragement">
                  🌿 "Writing your thoughts can help you understand your emotions better."
                </div>
              )}

              <button
                type="button"
                className="detect-continue-journal-btn"
                onClick={handleContinueToJournal}
              >
                📖 Continue to Journal
              </button>

              <button
                type="button"
                className="detect-new-reflection-btn"
                onClick={handleNewReflection}
              >
                🔄 Start New Reflection
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default DetectEmotion;
