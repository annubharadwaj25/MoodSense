/**
 * ml.js — Local ML emotion provider (Transformers.js / ONNX)
 * ----------------------------------------------------------------
 * Uses zero-shot text classification — no keyword matching.
 * Maps natural-language emotion labels to MoodSense categories.
 *
 * Model: Xenova/mobilebert-uncased-mnli (lightweight, runs locally).
 * First request downloads the model (~50 MB) and caches it.
 * ----------------------------------------------------------------
 */

const VALID_EMOTIONS = [
    "Happy",
    "Sad",
    "Angry",
    "Fear",
    "Anxious",
    "Calm",
    "Excited",
    "Neutral",
    "Stressed",
];

// Descriptive labels improve zero-shot accuracy over single words.
const CANDIDATE_LABELS = [
    { label: "feeling happy, joyful, grateful, or content", emotion: "Happy" },
    { label: "feeling sad, depressed, lonely, or heartbroken", emotion: "Sad" },
    { label: "feeling angry, furious, enraged, or livid", emotion: "Angry" },
    { label: "feeling afraid, scared, or frightened of something", emotion: "Fear" },
    { label: "feeling anxious, worried, nervous, or uneasy", emotion: "Anxious" },
    { label: "feeling calm, peaceful, serene, or relaxed", emotion: "Calm" },
    { label: "feeling excited, thrilled, eager, or enthusiastic", emotion: "Excited" },
    { label: "feeling neutral, okay, fine, or emotionally flat", emotion: "Neutral" },
    { label: "feeling stressed, overwhelmed, overworked, or burnt out", emotion: "Stressed" },
];

const LABELS = CANDIDATE_LABELS.map((c) => c.label);
const LABEL_TO_EMOTION = Object.fromEntries(
    CANDIDATE_LABELS.map((c) => [c.label, c.emotion])
);

let classifierPromise = null;

/**
 * Lazy-load the zero-shot classifier once per process.
 * Subsequent requests reuse the same pipeline — never reload the model.
 */
function getClassifier() {
    if (!classifierPromise) {
        classifierPromise = (async () => {
            const start = Date.now();
            console.log("🧠 Loading local emotion model (Xenova/mobilebert-uncased-mnli)…");
            const { pipeline } = await import("@xenova/transformers");
            const classifier = await pipeline(
                "zero-shot-classification",
                "Xenova/mobilebert-uncased-mnli"
            );
            console.log(`🧠 Emotion model ready in ${Date.now() - start}ms`);
            return classifier;
        })();
    }
    return classifierPromise;
}

/**
 * Preload the classifier at server boot so the first user request
 * does not pay model-download / ONNX-init latency.
 */
function warmup() {
    return getClassifier();
}

/**
 * Convert model score (0–1) to a user-facing confidence percentage.
 */
function toConfidence(score) {
    const pct = Math.round(score * 100);
    return Math.min(Math.max(pct, 52), 98);
}

/**
 * Detect emotion using local ML zero-shot classification.
 * @param {string} text
 * @returns {Promise<{ emotion: string, confidence: number, timestamp: string }>}
 */
async function detect(text) {
    const classifier = await getClassifier();
    const inferenceStart = Date.now();
    const output = await classifier(text, LABELS, { multi_label: false });
    console.log(`[ml] zero-shot inference ${Date.now() - inferenceStart}ms (chars=${text.length})`);

    const topLabel = output.labels[0];
    const topScore = output.scores[0];

    const emotion = LABEL_TO_EMOTION[topLabel] || "Neutral";
    const confidence = toConfidence(topScore);

    if (!VALID_EMOTIONS.includes(emotion)) {
        return {
            emotion: "Neutral",
            confidence: 60,
            timestamp: new Date().toISOString(),
        };
    }

    return {
        emotion,
        confidence,
        timestamp: new Date().toISOString(),
    };
}

const { generateReply } = require("../companionEngine");

/**
 * Generate a wellness companion chat response using the companion engine.
 * @param {Array} messages - [{ role: "user"|"ai", content: string }]
 * @param {string} emotion - the user's current detected emotion
 * @param {string} originalText - the user's original journal entry
 * @param {string} userName - user's name for personalized greeting
 * @param {boolean} isGreeting - whether this is the first greeting message
 * @returns {Promise<{ reply: string, provider: string }>}
 */
async function chat(messages, emotion, originalText, userName, isGreeting) {
    const result = generateReply({ messages, emotion, originalText, userName, isGreeting });
    return { ...result, provider: "ml" };
}

module.exports = { detect, chat, warmup };
