/**
 * IntentClassifier.js
 * ----------------------------------------------------------------
 * Robust intent classifier that identifies the user's primary intent
 * per turn. Rules are ordered so that more specific intents fire first,
 * preventing technical or emotional messages from falling through to
 * generic buckets.
 * ----------------------------------------------------------------
 */

const INTENTS = Object.freeze({
    TECHNICAL_QUERY: "TECHNICAL_QUERY",
    CAREER_ADVICE: "CAREER_ADVICE",
    FACTUAL_QUERY: "FACTUAL_QUERY",
    STUDY_DISCUSSION: "STUDY_DISCUSSION",
    RELATIONSHIP_DISCUSSION: "RELATIONSHIP_DISCUSSION",
    EMOTIONAL_SHARING: "EMOTIONAL_SHARING",
    CELEBRATION: "CELEBRATION",
    GRATITUDE: "GRATITUDE",
    CASUAL_CHAT: "CASUAL_CHAT",
});

// Keywords that strongly signal technology context
const TECH_WORDS = /\b(wifi|wi-fi|router|internet|password|login|log in|setup|set up|reset|install|error|bug|phone|mobile|laptop|computer|device|app|iphone|android|screen|bluetooth|charger|battery|update|download|software|hardware)\b/i;

// Action verbs that confirm a technical request (not just a mention)
const TECH_ACTION = /\b(how|fix|connect|reset|use|change|setup|set up|configure|install|update|download|turn on|turn off|help|trouble|work|not working|won't|broken|lost)\b/i;

class IntentClassifier {
    /**
     * Classifies the primary intent of a user message.
     * @param {string} text - User message text
     * @returns {string} Intent enum value
     */
    static classify(text = "") {
        const val = text.trim().toLowerCase();
        if (!val) return INTENTS.CASUAL_CHAT;

        // ---- 1. Gratitude ----
        if (/\b(thanks?|thank you|appreciate it|grateful|that helped|thanks a lot)\b/i.test(val)) {
            return INTENTS.GRATITUDE;
        }

        // ---- 2. Celebration / Achievement ----
        if (/\b(got (the|a) job|passed (the|my) (exam|test)|promoted|won|graduated|celebrat|achieved|yay|great news)\b/i.test(val)) {
            return INTENTS.CELEBRATION;
        }

        // ---- 3. Technical Query ----
        // Must have a tech keyword AND either an action verb or a question mark.
        if (TECH_WORDS.test(val) && (TECH_ACTION.test(val) || val.endsWith("?"))) {
            return INTENTS.TECHNICAL_QUERY;
        }

        // ---- 4. Career Advice ----
        if (/\b(job|career|interview|resume|cv|salary|promotion|boss|colleague|office|workplace|hiring)\b/i.test(val)) {
            return INTENTS.CAREER_ADVICE;
        }

        // ---- 5. Study Discussion ----
        if (/\b(exam|study|studying|homework|assignment|course|university|college|school|math|calculus|physics|subject|class|grade)\b/i.test(val)) {
            return INTENTS.STUDY_DISCUSSION;
        }

        // ---- 6. Relationship Discussion ----
        if (/\b(boyfriend|girlfriend|partner|husband|wife|dating|relationship|breakup|crush|argument|fight|best friend|upset with me)\b/i.test(val)) {
            return INTENTS.RELATIONSHIP_DISCUSSION;
        }

        // ---- 7. Emotional Sharing ----
        // Check this BEFORE factual queries so "I am happy" doesn't fall through.
        if (/\b(i feel|i am feeling|i'm feeling|feeling|i am happy|i am sad|i feel sad|i feel happy)\b/i.test(val) ||
            /\b(sad|happy|angry|upset|anxious|worried|stressed|overwhelmed|depressed|lonely|hurt|furious|scared|afraid|terrible|miserable|fantastic|joyful|wonderful|excited|thrilled|devastated|heartbroken|lost|down|low)\b/i.test(val)) {
            // Guard: if the message is clearly a factual question (starts with "what is", "define"), don't classify as emotional
            if (!/^(what is|what are|define|explain|who is|who discovered|how does|where is|when was)\b/i.test(val)) {
                return INTENTS.EMOTIONAL_SHARING;
            }
        }

        // ---- 8. Factual Query ----
        if (/^(what is|what are|define|explain|who is|who discovered|how far is|why is the sky|how does|how do|why do|why does|where is|when was|when did)\b/i.test(val)) {
            return INTENTS.FACTUAL_QUERY;
        }

        // ---- 9. General question (ends with ?) ----
        if (val.endsWith("?") || /^(how|what|why|when|where|who|can|should|could|would)\b/i.test(val)) {
            return INTENTS.FACTUAL_QUERY;
        }

        // ---- 10. Casual Chat & Recommendations ----
        if (/\b(relax|fun way|ideas|weekend|recommend|what do you think|how are you|hello|hi|hey)\b/i.test(val)) {
            return INTENTS.CASUAL_CHAT;
        }

        return INTENTS.CASUAL_CHAT;
    }
}

module.exports = { IntentClassifier, INTENTS };
