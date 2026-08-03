/**
 * detectEmotion.js
 * ----------------------------------------------------------------
 * Lightweight, dependency-free emotion detector.
 *
 * Scores a free-text journal entry against curated keyword lists
 * for the 8 MoodSense emotions, returning the highest-scoring one.
 * Falls back to "Neutral" when nothing matches.
 *
 * Returns one of:
 *   "Happy" | "Sad" | "Calm" | "Angry" |
 *   "Anxious" | "Excited" | "Stressed" | "Neutral"
 *
 * The keyword/phrase lists use whole-word matching with word
 * boundaries, so "happy" matches but "unhappy" does not count
 * toward the score (it is listed explicitly where it should).
 *
 * No ML dependencies — deterministic, fast, and fully auditable.
 * ----------------------------------------------------------------
 */

// ----------------------------------------------------------------
// Keyword / phrase lexicons
// Order matters only for tie-breaking (first defined wins on ties).
// ----------------------------------------------------------------
const LEXICONS = [
    {
        emotion: "Happy",
        words: [
            "happy", "happiness", "joy", "joyful", "joyous", "joyfully",
            "delighted", "delight", "glad", "cheerful", "cheer", "cheering",
            "grateful", "gratitude", "thankful", "content", "contented",
            "wonderful", "great", "awesome", "amazing", "fantastic",
            "smile", "smiling", "smiled", "laugh", "laughing", "laughed",
            "blessed", "bright", "lovely", "loved", "good day", "feel good",
            "proud", "hopeful", "blissful", "elated", "ecstatic", "thrilled",
            "satisfied", "fulfilled", "warm", "heartwarming", "sunny",
        ],
    },
    {
        emotion: "Calm",
        words: [
            "calm", "calming", "calmed", "peaceful", "peace", "serene",
            "serenity", "tranquil", "tranquility", "relaxed", "relax",
            "relaxing", "relaxedly", "restful", "at ease", "centered",
            "grounded", "still", "quiet", "quietly", "contentment",
            "soothing", "soothed", "gentle", "balanced", "mindful",
            "meditate", "meditation", "meditating", "breathe", "breathing",
            "clear mind", "unbothered", "steady", "composed", "mellow",
            "cozy", "snug", "easeful",
        ],
    },
    {
        emotion: "Excited",
        words: [
            "excited", "exciting", "excitement", "thrilled", "eager",
            "enthusiastic", "enthusiasm", "pumped", "hyped", "stoked",
            "energized", "energetic", "buzzing", "can't wait", "cannot wait",
            "looking forward", "ecstatic", "exhilarated", "electrified",
            "inspired", "inspiring", "motivated", "passionate", "fired up",
            "alive", "vibrant", "giddy", "anticipation", "wonderful news",
            "celebrate", "celebrating", "celebration", "yay", "woohoo",
        ],
    },
    {
        emotion: "Neutral",
        words: [
            "neutral", "okay", "ok", "fine", "alright", "alrighty",
            "nothing much", "same as usual", "ordinary", "normal", "routine",
            "uneventful", "so-so", "meh", "average", "regular day", "as usual",
            "nothing special", "nothing new", "typical", "indifferent",
            "neither good nor bad", "just a day",
        ],
    },
    {
        emotion: "Sad",
        words: [
            "sad", "sadness", "unhappy", "down", "blue", "depressed",
            "depression", "miserable", "heartbroken", "heartbreak",
            "heartbreaking", "grief", "grieving", "grieved", "loss", "lost",
            "lonely", "loneliness", "alone", "cry", "crying", "cried", "tears",
            "tearful", "hopeless", "empty", "numb", "hurt", "hurting",
            "broken", "despair", "gloomy", "melancholy", "downhearted",
            "rejected", "abandoned", "miss", "missing",
        ],
    },
    {
        emotion: "Anxious",
        words: [
            "anxious", "anxiety", "nervous", "nervously", "worried", "worry",
            "worrying", "uneasy", "uneasiness", "panic", "panic attack",
            "panicking", "tense", "tension", "on edge", "restless",
            "dread", "dreading", "fearful", "afraid", "scared", "frightened",
            "apprehensive", "overthinking", "overthink", "racing thoughts",
            "overwhelmed", "unsettled", "jittery", "shaky", "queasy",
            "what if", "can't stop thinking", "stomach in knots",
        ],
    },
    {
        emotion: "Angry",
        words: [
            "angry", "anger", "mad", "furious", "rage", "enraged", "livid",
            "irritated", "irritating", "irritation", "annoyed", "annoying",
            "frustrated", "frustration", "frustrating", "resentful",
            "resentment", "bitter", "hostile", "outraged", "infuriated",
            "pissed", "fed up", "had enough", "disgusted", "agitated",
            "provoked", "triggered", "hate", "hated", "unfair", "wronged",
            "betrayed", "swore", "cursing",
        ],
    },
    {
        emotion: "Stressed",
        words: [
            "stressed", "stress", "stressful", "pressured", "pressure",
            "overworked", "burnt out", "burnout", "burned out", "exhausted",
            "exhaustion", "drained", "swamped", "snowed under", "overloaded",
            "deadline", "deadlines", "too much to do", "no time", "rushed",
            "rushing", "chaotic", "overwhelm", "stretched thin", "underwater",
            "buried", "behind on", "behind schedule", "can't keep up",
            "burning out", "worn out", "wiped out", "fried", "scrambling",
        ],
    },
];

// ----------------------------------------------------------------
// Build a single case-insensitive matcher per emotion.
// We escape regex metacharacters so phrases like "what if" are safe.
// ----------------------------------------------------------------
const wordBoundaryPhrase = (phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const MATCHERS = LEXICONS.map(({ emotion, words }) => ({
    emotion,
    // Match whole words: \b only works for word characters, so we use
    // lookarounds that accept either a boundary or a non-word edge.
    regex: new RegExp(
        words
            .map((w) => `(^|[^a-z])${wordBoundaryPhrase(w)}([^a-z]|$)`)
            .join("|"),
        "gi"
    ),
}));

/**
 * Detect the dominant emotion in a piece of text.
 *
 * @param {string} text - the journal entry text
 * @returns {string} one of the 8 MoodSense emotions ("Neutral" if none match)
 */
function detectEmotion(text) {
    if (!text || typeof text !== "string") {
        return "Neutral";
    }

    const normalized = text.toLowerCase();

    let bestEmotion = "Neutral";
    let bestScore = 0;

    for (const { emotion, regex } of MATCHERS) {
        // Count distinct match groups to score strength.
        const matches = normalized.match(regex);
        const score = matches ? matches.length : 0;

        if (score > bestScore) {
            bestScore = score;
            bestEmotion = emotion;
        }
    }

    return bestEmotion;
}

module.exports = detectEmotion;
module.exports.LEXICONS = LEXICONS;
