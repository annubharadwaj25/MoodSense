/* ----------------------------------------------------------------
   emotions.js — shared emotion metadata + helpers
   Single source of truth for labels, emojis, and the soft calming
   palette used across the dashboard pie chart and summary card.

   Colors are deliberately muted (no neon / no flashy gradients) and
   sit well within the MoodSense cream + sage + terracotta system.
---------------------------------------------------------------- */

export const EMOTIONS = {
  Happy:    { emoji: "😊", color: "#7c9885" }, // green
  Sad:      { emoji: "😔", color: "#6b8cae" }, // blue
  Angry:    { emoji: "😡", color: "#c47b6a" }, // red
  Fear:     { emoji: "😨", color: "#a89bc4" }, // purple
  Calm:     { emoji: "😌", color: "#5f9ea0" }, // teal
  Neutral:  { emoji: "😐", color: "#b3a89f" }, // grey
  Excited:  { emoji: "🤩", color: "#e0b86a" }, // warm yellow
  Anxious:  { emoji: "😟", color: "#d99a73" }, // light orange
  Stressed: { emoji: "😣", color: "#9b8cb5" }, // lavender
};

// Emotions considered "positive" for the trend line in the summary card.
export const POSITIVE_EMOTIONS = ["Happy", "Calm", "Excited"];

/**
 * Look up metadata for an emotion string, with a safe fallback
 * for any unexpected value coming from the backend.
 */
export function getEmotionMeta(emotion) {
  return (
    EMOTIONS[emotion] || {
      emoji: "📝",
      color: "#b3a89f", // soft gray fallback
    }
  );
}

/**
 * Convert [{ emotion, count }] into a chart-ready shape that
 * includes the total, percentage, color, and emoji for each slice.
 * Pure / reusable — no side effects.
 *
 * @param {Array<{emotion:string, count:number}>} data
 * @returns {{rows: Array, total: number}}
 */
export function buildChartData(data) {
  const total = (data || []).reduce((sum, d) => sum + (d.count || 0), 0);

  const rows = (data || []).map((d) => {
    const meta = getEmotionMeta(d.emotion);
    const percent = total > 0 ? Math.round((d.count / total) * 100) : 0;
    return {
      emotion: d.emotion,
      count: d.count,
      percent,
      ...meta,
    };
  });

  return { rows, total };
}

/**
 * Find the most frequent emotion from raw [{ emotion, count }] data.
 * Assumes the backend already sorts by count desc, but sorts again
 * defensively. Returns null when data is empty.
 */
export function getTopEmotion(data) {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return sorted[0];
}
