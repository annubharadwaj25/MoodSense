import { getEmotionMeta } from "../../utils/emotions";

function DetectResultCard({ emotion, confidence, timestamp }) {
  const meta = getEmotionMeta(emotion);

  return (
    <div className="detect-result-card detect-fade-in">
      <span className="detect-result-eyebrow">
        {meta.emoji} Emotion Detected
      </span>

      <div className="detect-result-main">
        <span className="detect-result-emoji" aria-hidden="true">
          {meta.emoji}
        </span>
        <h2 className="detect-result-emotion">{emotion}</h2>
      </div>

      <div className="detect-result-confidence">
        <div className="detect-result-confidence-head">
          <span>Confidence</span>
          <strong>{confidence}%</strong>
        </div>
        <div
          className="detect-result-bar"
          role="progressbar"
          aria-valuenow={confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence score ${confidence} percent`}
        >
          <div
            className="detect-result-bar-fill"
            style={{ width: `${confidence}%`, backgroundColor: meta.color }}
          />
        </div>
        <p className="detect-result-timestamp">
          ✅ Detected Successfully ·{" "}
          {new Date(timestamp).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}

export default DetectResultCard;
