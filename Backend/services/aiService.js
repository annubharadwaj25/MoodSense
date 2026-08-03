/**
 * aiService.js — Provider-agnostic AI service
 * ----------------------------------------------------------------
 * Factory that picks the AI provider based on the AI_PROVIDER
 * environment variable. Ships with two providers:
 *
 *   "openai"   → uses the OpenAI Chat Completions API
 *   "ml"       → local zero-shot ML model (default, no API key)
 *   "keyword"  → legacy keyword scorer (explicit opt-in only)
 *
 * To add a new provider (Gemini, Claude, etc.):
 *   1. Create a new file in services/providers/ that exports
 *      async detect(text) and async chat(messages, emotion).
 *   2. Add the provider name to this file's PROVIDERS map.
 *   3. Set AI_PROVIDER=<name> in .env.
 * ----------------------------------------------------------------
 */

const keywordProvider = require("./providers/keyword");
const mlProvider = require("./providers/ml");

// Lazy-load the OpenAI provider only when it's actually selected,
// so the app starts without error even if OPENAI_API_KEY is missing.
let _openaiProvider = null;

function getOpenAI() {
    if (!_openaiProvider) {
        _openaiProvider = require("./providers/openai");
    }
    return _openaiProvider;
}

// ---- Provider registry ----
const PROVIDERS = {
    openai: () => getOpenAI(),
    ml: () => mlProvider,
    keyword: () => keywordProvider,
};

// Pick the active provider once at startup.
// Default to local ML — real prediction, not keyword matching.
const ACTIVE_KEY = (process.env.AI_PROVIDER || "ml").toLowerCase();
const providerLoader = PROVIDERS[ACTIVE_KEY];

let activeProvider;

if (providerLoader) {
    try {
        activeProvider = providerLoader();
    } catch (err) {
        console.warn(
            `⚠️  Failed to load AI provider "${ACTIVE_KEY}": ${err.message}`
        );
        console.warn('   Falling back to "ml" provider.');
        activeProvider = mlProvider;
    }
} else {
    console.warn(
        `⚠️  Unknown AI_PROVIDER "${ACTIVE_KEY}". Falling back to "ml".`
    );
    activeProvider = mlProvider;
}

console.log(`🤖 AI provider active: ${ACTIVE_KEY}`);

// ---- Public API ----

/**
 * Detect the dominant emotion in a piece of text.
 * @param {string} text
 * @returns {Promise<{ emotion: string, confidence: number, timestamp: string }>}
 */
async function detectEmotion(text) {
    return activeProvider.detect(text);
}

/**
 * Generate a wellness companion chat response.
 * @param {Array} messages - [{ role: "user"|"ai", content: string }]
 * @param {string} emotion - the user's current detected emotion
 * @param {string} originalText - the user's original journal entry
 * @param {string} userName - user's name for personalized greeting
 * @param {boolean} isGreeting - whether this is the first greeting message
 * @returns {Promise<{ reply: string, provider: string }>}
 */
async function chat(messages, emotion, originalText, userName, isGreeting) {
    return activeProvider.chat(messages, emotion, originalText, userName, isGreeting);
}

/**
 * Get the name of the currently active provider (for frontend display).
 */
function getProviderName() {
    return ACTIVE_KEY;
}

module.exports = { detectEmotion, chat, getProviderName };
