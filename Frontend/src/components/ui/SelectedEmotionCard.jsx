import { getEmotionMeta } from "../../utils/emotions";

/* ----------------------------------------------------------------
   SelectedEmotionCard
   Displays the currently selected emotion from the pie chart.
   Shows emoji, name, percentage, and entry count.
---------------------------------------------------------------- */

export default function SelectedEmotionCard({ selectedEmotion, total }) {
  if (!selectedEmotion) return null;

  const meta = getEmotionMeta(selectedEmotion.emotion);
  const percent = total > 0 ? Math.round((selectedEmotion.count / total) * 100) : 0;

  return (
    <div className="selected-emotion-card">
      <div className="selected-emotion-header">
        <span
          className="selected-emotion-badge"
          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
        >
          {meta.emoji}
        </span>
        <div>
          <h3 className="selected-emotion-title">{selectedEmotion.emotion}</h3>
          <p className="selected-emotion-sub">{percent}% of all records</p>
        </div>
      </div>

      <div className="selected-emotion-stats">
        <div className="selected-emotion-stat">
          <span className="selected-emotion-stat-num">{selectedEmotion.count}</span>
          <span className="selected-emotion-stat-label">Entries</span>
        </div>
        <div className="selected-emotion-stat">
          <span className="selected-emotion-stat-num">{percent}%</span>
          <span className="selected-emotion-stat-label">Percentage</span>
        </div>
      </div>
    </div>
  );
}
