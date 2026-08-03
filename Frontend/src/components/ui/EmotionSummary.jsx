import { getTopEmotion, getEmotionMeta, POSITIVE_EMOTIONS } from "../../utils/emotions";

/* ----------------------------------------------------------------
   EmotionSummary
   Right-hand panel summarizing the user's dominant emotion.
   Everything is derived from the `data` prop (no hardcoded text),
   so it updates automatically as the underlying data changes.

   - Most Frequent Emotion (label + emoji)
   - Its percentage of all records
   - Its raw journal count
   - A short trend line based on whether the top emotion is positive
---------------------------------------------------------------- */

// Calm, supportive trend messages.
function trendLine(topEmotion, total) {
  if (!topEmotion) {
    return "Keep journaling — your emotional patterns will appear here.";
  }
  const isPositive = POSITIVE_EMOTIONS.includes(topEmotion.emotion);
  const noun = total === 1 ? "journal" : "journals";
  return isPositive
    ? `✨ You're having a positive emotional trend across your ${total} ${noun}.`
    : `🌿 A reflective day. A short check-in can help you feel more grounded.`;
}

export default function EmotionSummary({ data }) {
  const top = getTopEmotion(data);
  const total = (data || []).reduce((s, d) => s + (d.count || 0), 0);

  const emotionLabel = top ? top.emotion : "—";
  const meta = top ? getEmotionMeta(top.emotion) : getEmotionMeta();
  const percent =
    top && total > 0 ? Math.round((top.count / total) * 100) : 0;
  const count = top ? top.count : 0;

  return (
    <div className="emotion-summary">
      <span className="emotion-summary-eyebrow">
        😊 Most Frequent Emotion
      </span>

      <div className="emotion-summary-hero">
        <span
          className="emotion-summary-badge"
          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
        >
          {meta.emoji}
        </span>
        <div>
          <h3 className="emotion-summary-title">{emotionLabel}</h3>
          <p className="emotion-summary-sub">
            {percent}% of all records
          </p>
        </div>
      </div>

      <div className="emotion-summary-stats">
        <div className="emotion-summary-stat">
          <span className="emotion-summary-stat-num">{count}</span>
          <span className="emotion-summary-stat-label">Journals</span>
        </div>
        <div className="emotion-summary-stat">
          <span className="emotion-summary-stat-num">{total}</span>
          <span className="emotion-summary-stat-label">Total Records</span>
        </div>
      </div>

      <p className="emotion-summary-trend">{trendLine(top, total)}</p>
    </div>
  );
}
