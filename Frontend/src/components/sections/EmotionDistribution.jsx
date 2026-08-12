import { useState } from "react";
import Spinner from "../ui/Spinner";
import EmotionPieChart from "../ui/EmotionPieChart";
import EmotionSummary from "../ui/EmotionSummary";
import EmotionEmptyState from "../ui/EmotionEmptyState";
import SelectedEmotionCard from "../ui/SelectedEmotionCard";

/* ----------------------------------------------------------------
   EmotionDistribution
   A self-contained dashboard section. Fetches the user's real
   emotion distribution from the backend, then renders one of:
     - Spinner           (loading)
     - EmotionEmptyState (no journals yet)
     - Pie + Summary     (loaded)

   The existing Dashboard layout, palette and cards are untouched;
   this section simply renders below them.
---------------------------------------------------------------- */

export default function EmotionDistribution({ data = [], loading = false }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const handleEmotionSelect = (emotionData) => {
    setSelectedEmotion(emotionData);
  };

  const total = (data || []).reduce((s, d) => s + (d.count || 0), 0);

  return (
    <section className="emotion-distribution">
      <div className="emotion-distribution-head">
        <span className="emotion-distribution-eyebrow">Insights</span>
        <h2 className="emotion-distribution-title">
          😊 Emotion Distribution
        </h2>
      </div>

      {loading ? (
        <div className="emotion-distribution-loading">
          <Spinner />
        </div>
      ) : data.length === 0 ? (
        <EmotionEmptyState />
      ) : (
        <div className="emotion-distribution-grid">
          <div className="emotion-distribution-chart-card">
            <div className="emotion-distribution-content">
              <div className="emotion-chart-wrapper">
                <EmotionPieChart data={data} onEmotionSelect={handleEmotionSelect} />
              </div>
              {selectedEmotion && (
                <SelectedEmotionCard selectedEmotion={selectedEmotion} total={total} />
              )}
            </div>
          </div>
          <EmotionSummary data={data} />
        </div>
      )}
    </section>
  );
}
