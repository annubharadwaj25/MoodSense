/**
 * TopicTracker.js
 * ----------------------------------------------------------------
 * Identifies the current topic and tracks topic switches across turns.
 * Matches keywords using word boundaries to prevent substring matches (e.g. "app" in "happy").
 * ----------------------------------------------------------------
 */

const TOPICS = Object.freeze({
    TECHNOLOGY: "technology",
    CAREER: "career",
    STUDIES: "studies",
    RELATIONSHIP: "relationship",
    FACTUAL_KNOWLEDGE: "factual_knowledge",
    CELEBRATION: "celebration",
    WELLNESS: "wellness",
    CASUAL: "casual",
});

const TOPIC_KEYWORDS = {
    [TOPICS.TECHNOLOGY]: ["phone", "mobile", "laptop", "computer", "wifi", "wi-fi", "router", "app", "software", "internet", "password", "device", "screen", "reset", "bug", "code", "iphone", "android"],
    [TOPICS.CAREER]: ["job", "work", "career", "boss", "colleague", "office", "promotion", "salary", "interview", "resume", "workplace", "company"],
    [TOPICS.STUDIES]: ["school", "college", "university", "exam", "study", "studying", "class", "homework", "assignment", "grade", "test", "course", "math", "physics", "subject"],
    [TOPICS.RELATIONSHIP]: ["boyfriend", "girlfriend", "partner", "husband", "wife", "dating", "relationship", "breakup", "crush", "friend", "marriage"],
    [TOPICS.CELEBRATION]: ["passed", "won", "got the job", "graduated", "celebrate", "promoted", "achievement"],
};

class TopicTracker {
    /**
     * Identifies topic for a message.
     * @param {string} text 
     * @param {string} intent 
     * @returns {string} Topic name
     */
    static detectTopic(text = "", intent = "") {
        const val = text.toLowerCase();

        // 1. Check intent override first if specific
        if (intent === "EMOTIONAL_SHARING") return TOPICS.WELLNESS;
        if (intent === "CELEBRATION") return TOPICS.CELEBRATION;
        if (intent === "FACTUAL_QUERY") return TOPICS.FACTUAL_KNOWLEDGE;

        // 2. Check keyword maps using word boundary
        for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
            for (const kw of keywords) {
                const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
                if (regex.test(val)) {
                    return topic;
                }
            }
        }

        if (intent === "TECHNICAL_QUERY") return TOPICS.TECHNOLOGY;
        if (intent === "CAREER_ADVICE") return TOPICS.CAREER;
        if (intent === "STUDY_DISCUSSION") return TOPICS.STUDIES;
        if (intent === "RELATIONSHIP_DISCUSSION") return TOPICS.RELATIONSHIP;

        return TOPICS.CASUAL;
    }

    /**
     * Determines whether a topic switch occurred compared to previous turns.
     * @param {string} currentTopic 
     * @param {Array} history 
     * @returns {Object} { hasSwitched: boolean, previousTopic: string }
     */
    static analyzeTopicTransition(currentTopic, history = []) {
        if (!Array.isArray(history) || history.length < 2) {
            return { hasSwitched: false, previousTopic: null };
        }

        // Look at previous user messages
        let previousTopic = null;
        for (let i = history.length - 2; i >= 0; i--) {
            if (history[i].role === "user") {
                const prevTop = this.detectTopic(history[i].content);
                if (prevTop && prevTop !== TOPICS.CASUAL) {
                    previousTopic = prevTop;
                    break;
                }
            }
        }

        const hasSwitched = Boolean(
            previousTopic &&
            currentTopic &&
            currentTopic !== TOPICS.CASUAL &&
            previousTopic !== currentTopic
        );

        return { hasSwitched, previousTopic };
    }
}

module.exports = { TopicTracker, TOPICS };
