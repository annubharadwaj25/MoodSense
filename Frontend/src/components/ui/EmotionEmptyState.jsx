import { useNavigate } from "react-router-dom";

/* ----------------------------------------------------------------
   EmotionEmptyState
   Shown when the user has no journal records yet. Includes a
   "Detect Emotion" CTA that routes to the existing /detect page.
---------------------------------------------------------------- */

export default function EmotionEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="emotion-empty">
      <div className="emotion-empty-orb" aria-hidden="true">
        🌱
      </div>

      <h3 className="emotion-empty-title">
        No emotion data available yet.
      </h3>

      <p className="emotion-empty-sub">
        Start detecting your emotions to view your emotional distribution.
      </p>

      <button
        className="emotion-empty-cta"
        onClick={() => navigate("/detect")}
      >
        Detect Emotion
      </button>
    </div>
  );
}
