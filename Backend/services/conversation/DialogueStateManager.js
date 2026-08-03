/**
 * DialogueStateManager.js
 * ----------------------------------------------------------------
 * Tracks dynamic multi-turn dialogue states and handles state transitions.
 * ----------------------------------------------------------------
 */

const DIALOGUE_STATES = Object.freeze({
    INIT: "INIT",
    ANSWERING_QUERY: "ANSWERING_QUERY",
    PROVIDING_ADVICE: "PROVIDING_ADVICE",
    EXPLORING_TOPIC: "EXPLORING_TOPIC",
    TOPIC_PIVOT: "TOPIC_PIVOT",
    EMPATHIZING: "EMPATHIZING",
    CELEBRATING: "CELEBRATING",
    CASUAL_ENGAGEMENT: "CASUAL_ENGAGEMENT",
});

class DialogueStateManager {
    /**
     * Updates dialogue state based on intent, topic transition, and history.
     * @param {Object} params
     * @param {string} params.intent
     * @param {string} params.topic
     * @param {boolean} params.hasSwitchedTopic
     * @param {number} params.turnCount
     * @returns {string} Current dialogue state
     */
    static updateState({ intent, topic, hasSwitchedTopic, turnCount = 0 }) {
        if (turnCount <= 1 && intent === "CASUAL_CHAT") {
            return DIALOGUE_STATES.INIT;
        }

        if (hasSwitchedTopic) {
            return DIALOGUE_STATES.TOPIC_PIVOT;
        }

        switch (intent) {
            case "TECHNICAL_QUERY":
            case "FACTUAL_QUERY":
                return DIALOGUE_STATES.ANSWERING_QUERY;

            case "CAREER_ADVICE":
            case "STUDY_DISCUSSION":
                return DIALOGUE_STATES.PROVIDING_ADVICE;

            case "RELATIONSHIP_DISCUSSION":
                return DIALOGUE_STATES.EXPLORING_TOPIC;

            case "EMOTIONAL_SHARING":
                return DIALOGUE_STATES.EMPATHIZING;

            case "CELEBRATION":
                return DIALOGUE_STATES.CELEBRATING;

            default:
                return DIALOGUE_STATES.CASUAL_ENGAGEMENT;
        }
    }
}

module.exports = { DialogueStateManager, DIALOGUE_STATES };
