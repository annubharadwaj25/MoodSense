/**
 * ResponsePlanner.js
 * ----------------------------------------------------------------
 * Synthesizes Intent, Topic, Dialogue State, Memory Context, and Emotion Context
 * into an actionable response plan.
 * ----------------------------------------------------------------
 */

class ResponsePlanner {
    /**
     * Constructs a response plan for the current turn.
     * @param {Object} inputs
     * @param {string} inputs.intent
     * @param {string} inputs.topic
     * @param {Object} inputs.memoryContext
     * @param {string} inputs.dialogueState
     * @param {string} inputs.emotion
     * @param {boolean} inputs.hasSwitchedTopic
     * @param {string} inputs.previousTopic
     * @returns {Object} Response Plan
     */
    static createPlan({
        intent,
        topic,
        memoryContext,
        dialogueState,
        emotion = "Neutral",
        hasSwitchedTopic = false,
        previousTopic = null,
    }) {
        let strategy = "DIRECT_ANSWER";
        const safeEmotion = (emotion || "Neutral").toLowerCase();

        // Determine Tone from Emotion (Emotion SUPPORTS, does not control)
        let tone = "friendly_warm";
        if (safeEmotion === "happy" || safeEmotion === "excited") {
            tone = "encouraging_upbeat";
        } else if (safeEmotion === "sad") {
            tone = "gentle_supportive";
        } else if (safeEmotion === "angry") {
            tone = "calm_composed";
        } else if (safeEmotion === "anxious" || safeEmotion === "stressed" || safeEmotion === "fear") {
            tone = "reassuring_grounded";
        }

        // Determine Strategy from Intent & Dialogue State
        if (hasSwitchedTopic) {
            strategy = "TOPIC_PIVOT_AND_ANSWER";
        } else if (intent === "TECHNICAL_QUERY") {
            strategy = "DIRECT_TECHNICAL_ANSWER";
        } else if (intent === "CAREER_ADVICE") {
            strategy = "CAREER_ADVICE_PLAN";
        } else if (intent === "FACTUAL_QUERY") {
            strategy = "FACTUAL_EXPLANATION";
        } else if (intent === "STUDY_DISCUSSION") {
            strategy = "STUDY_SUPPORT";
        } else if (intent === "RELATIONSHIP_DISCUSSION") {
            strategy = "RELATIONSHIP_LISTENING";
        } else if (intent === "CELEBRATION") {
            strategy = "CELEBRATION_CONGRATS";
        } else if (intent === "EMOTIONAL_SHARING") {
            strategy = "EMPATHETIC_REFLECTION";
        } else if (intent === "GRATITUDE") {
            strategy = "GRATITUDE_RESPONSE";
        } else {
            strategy = "CASUAL_ENGAGEMENT";
        }

        return {
            strategy,
            tone,
            intent,
            topic,
            hasSwitchedTopic,
            previousTopic,
            dialogueState,
            latestUserMessage: memoryContext.latestUserMessage,
            entities: memoryContext.entities,
        };
    }
}

module.exports = ResponsePlanner;
