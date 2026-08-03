/**
 * ConversationManager.js
 * ----------------------------------------------------------------
 * Central pipeline orchestrator for the Mood Companion backend.
 * Coordinates MemoryManager, IntentClassifier, TopicTracker,
 * DialogueStateManager, ResponsePlanner, ResponseGenerator, and PhraseHistoryManager.
 * ----------------------------------------------------------------
 */

const MemoryManager = require("./MemoryManager");
const { IntentClassifier } = require("./IntentClassifier");
const { TopicTracker } = require("./TopicTracker");
const { DialogueStateManager } = require("./DialogueStateManager");
const PhraseHistoryManager = require("./PhraseHistoryManager");
const ResponsePlanner = require("./ResponsePlanner");
const ResponseGenerator = require("./ResponseGenerator");

class ConversationManager {
    constructor() {
        this.phraseHistoryManager = new PhraseHistoryManager();
    }

    /**
     * Processes an incoming chat turn and returns the synthesized AI response.
     * @param {Object} params
     * @param {Array} params.messages - Array of [{ role: 'user'|'ai', content: string }]
     * @param {string} params.emotion - Emotion context (e.g. Happy, Sad, Angry, Neutral)
     * @param {string} params.userName - User's display name
     * @param {boolean} params.isGreeting - First greeting flag
     * @returns {Object} { reply: string, intent: string, topic: string, dialogueState: string }
     */
    processTurn({ messages = [], emotion = "Neutral", userName = "friend", isGreeting = false }) {
        console.log("\n--- [ConversationManager.processTurn] START ---");

        // 1. Extract memory context
        const memoryContext = MemoryManager.getMemoryContext(messages);
        const latestUserMessage = memoryContext.latestUserMessage;
        console.log("[CM] latestUserMessage:", JSON.stringify(latestUserMessage));
        console.log("[CM] emotion context:", emotion);
        console.log("[CM] totalTurns:", memoryContext.totalTurns);

        // Special handling for initial greeting with no user message
        if (isGreeting && !latestUserMessage) {
            const greeting = `Hey ${userName}, I'm here with you. What's on your mind today?`;
            console.log("[CM] → GREETING path (no user message yet)");
            console.log("--- [ConversationManager.processTurn] END ---\n");
            return {
                reply: greeting,
                intent: "CASUAL_CHAT",
                topic: "casual",
                dialogueState: "INIT",
            };
        }

        // 2. Classify intent
        const intent = IntentClassifier.classify(latestUserMessage);
        console.log("[CM] DETECTED INTENT:", intent);

        // 3. Track topic and topic transitions
        const topic = TopicTracker.detectTopic(latestUserMessage, intent);
        const { hasSwitched, previousTopic } = TopicTracker.analyzeTopicTransition(topic, messages);
        console.log("[CM] DETECTED TOPIC:", topic);
        console.log("[CM] TOPIC SWITCHED:", hasSwitched, "| previousTopic:", previousTopic);

        // 4. Update Dialogue State
        const dialogueState = DialogueStateManager.updateState({
            intent,
            topic,
            hasSwitchedTopic: hasSwitched,
            turnCount: memoryContext.totalTurns,
        });
        console.log("[CM] DIALOGUE STATE:", dialogueState);

        // 5. Formulate Response Plan
        const plan = ResponsePlanner.createPlan({
            intent,
            topic,
            memoryContext,
            dialogueState,
            emotion,
            hasSwitchedTopic: hasSwitched,
            previousTopic,
        });
        console.log("[CM] RESPONSE PLAN strategy:", plan.strategy, "| tone:", plan.tone);

        // 6. Generate Response
        const reply = ResponseGenerator.generate(plan, this.phraseHistoryManager);
        console.log("[CM] FINAL REPLY:", JSON.stringify(reply));
        console.log("--- [ConversationManager.processTurn] END ---\n");

        return {
            reply,
            intent,
            topic,
            dialogueState,
        };
    }
}

module.exports = ConversationManager;
